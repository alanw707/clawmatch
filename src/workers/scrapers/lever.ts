/**
 * Lever scraper
 * Lever exposes a clean public JSON API:
 * https://api.lever.co/v0/postings/{company}?mode=json
 */

const LEVER_COMPANIES = [
  "netflix", "reddit", "coinbase", "scale-ai", "palantir",
  "databricks", "snowflake", "hashicorp", "confluent", "gitlab",
  // Add more as we grow
];

export interface LeverJob {
  id: string;
  text: string; // title
  hostedUrl: string;
  createdAt: number; // unix ms
  categories: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
  };
  description: string;
  lists: { text: string; content: string }[];
}

export interface NormalizedJob {
  externalId: string;
  source: "lever";
  sourceUrl: string;
  companyName: string;
  title: string;
  location: string;
  isRemote: boolean;
  postedAt: Date;
  description: string;
  atsPlatform: "lever";
  rawData: object;
}

export async function scrapeLever(companySlug: string): Promise<NormalizedJob[]> {
  const url = `https://api.lever.co/v0/postings/${companySlug}?mode=json&limit=250`;

  const res = await fetch(url, {
    headers: { "User-Agent": "ClawMatch Job Aggregator (contact@getclawmatch.com)" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    console.warn(`[Lever] Failed for ${companySlug}: ${res.status}`);
    return [];
  }

  const data = await res.json() as LeverJob[];
  const jobs: NormalizedJob[] = [];

  for (const job of data ?? []) {
    const location = job.categories?.location ?? "";
    const commitment = job.categories?.commitment ?? "";
    const isRemote =
      location.toLowerCase().includes("remote") ||
      commitment.toLowerCase().includes("remote");

    // Build plain text description from lists
    const desc = [
      job.description,
      ...(job.lists ?? []).map((l) => `${l.text}: ${l.content}`),
    ].join("\n\n");

    jobs.push({
      externalId: `lever-${companySlug}-${job.id}`,
      source: "lever",
      sourceUrl: job.hostedUrl,
      companyName: companySlug.charAt(0).toUpperCase() + companySlug.replace(/-/g, " ").slice(1),
      title: job.text,
      location,
      isRemote,
      postedAt: new Date(job.createdAt),
      description: desc,
      atsPlatform: "lever",
      rawData: job,
    });
  }

  return jobs;
}

export async function scrapeAllLever(): Promise<NormalizedJob[]> {
  const results: NormalizedJob[] = [];

  for (const company of LEVER_COMPANIES) {
    try {
      const jobs = await scrapeLever(company);
      results.push(...jobs);
      console.log(`[Lever] ${company}: ${jobs.length} jobs`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`[Lever] Error for ${company}:`, err);
    }
  }

  console.log(`[Lever] Total: ${results.length} jobs`);
  return results;
}
