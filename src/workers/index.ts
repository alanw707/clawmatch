/**
 * ClawMatch Worker Process
 * Runs on Railway — handles all background jobs via BullMQ
 */

import { Worker, Queue, QueueEvents } from "bullmq";
import { scrapeAllGreenhouse } from "./scrapers/greenhouse";
import { scrapeAllLever } from "./scrapers/lever";

const connection = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
};

// ── Queue Definitions ──────────────────────────────────────────

export const scrapeQueue = new Queue("scrape", { connection });
export const matchQueue = new Queue("match", { connection });
export const agentQueue = new Queue("agent", { connection });

// ── Scraper Worker ─────────────────────────────────────────────

const scraperWorker = new Worker(
  "scrape",
  async (job) => {
    console.log(`[Scraper] Running job: ${job.name}`);

    switch (job.name) {
      case "greenhouse":
        const ghJobs = await scrapeAllGreenhouse();
        // TODO: upsert to DB
        return { count: ghJobs.length };

      case "lever":
        const lvJobs = await scrapeAllLever();
        // TODO: upsert to DB
        return { count: lvJobs.length };

      default:
        console.warn(`[Scraper] Unknown job: ${job.name}`);
    }
  },
  { connection, concurrency: 2 }
);

// ── Agent Worker ───────────────────────────────────────────────

const agentWorker = new Worker(
  "agent",
  async (job) => {
    console.log(`[Agent] Running job: ${job.name} for application ${job.data.applicationId}`);

    if (job.name === "apply") {
      const { runAgentLoop } = await import("../server/services/agent/orchestrator");
      const result = await runAgentLoop(job.data);
      // TODO: update application record with result
      return result;
    }
  },
  { connection, concurrency: 5 }
);

// ── Scheduled Jobs ─────────────────────────────────────────────

async function scheduleRecurringJobs() {
  // Greenhouse: every 6 hours
  await scrapeQueue.add("greenhouse", {}, {
    repeat: { pattern: "0 */6 * * *" },
    jobId: "scrape-greenhouse-recurring",
  });

  // Lever: every 6 hours (offset by 30 min)
  await scrapeQueue.add("lever", {}, {
    repeat: { pattern: "30 */6 * * *" },
    jobId: "scrape-lever-recurring",
  });

  console.log("[Scheduler] Recurring jobs registered");
}

// ── Startup ────────────────────────────────────────────────────

console.log("[Workers] Starting ClawMatch worker process...");
scheduleRecurringJobs().catch(console.error);

scraperWorker.on("completed", (job, result) => {
  console.log(`[Scraper] ✅ ${job.name} completed:`, result);
});

scraperWorker.on("failed", (job, err) => {
  console.error(`[Scraper] ❌ ${job?.name} failed:`, err.message);
});

agentWorker.on("completed", (job) => {
  console.log(`[Agent] ✅ ${job.name} completed for application ${job.data.applicationId}`);
});

agentWorker.on("failed", (job, err) => {
  console.error(`[Agent] ❌ ${job?.name} failed:`, err.message);
});

process.on("SIGTERM", async () => {
  console.log("[Workers] Shutting down gracefully...");
  await scraperWorker.close();
  await agentWorker.close();
  process.exit(0);
});
