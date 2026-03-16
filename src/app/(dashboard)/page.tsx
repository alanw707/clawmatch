"use client";

import { JobCard } from "@/components/job-card";
import { useState } from "react";
import type { Job } from "@/types";

// Demo data until we wire up the real API
const DEMO_JOBS: (Job & { matchScore: number; skillsOverlap: string[]; skillsGap: string[] })[] = [
  {
    id: "1",
    externalId: "gh-1",
    source: "greenhouse",
    sourceUrl: "https://boards.greenhouse.io/anthropic/jobs/1234",
    companyName: "Anthropic",
    companyUrl: "https://anthropic.com",
    title: "Senior Software Engineer, Platform",
    description: "",
    location: "San Francisco, CA",
    isRemote: true,
    salaryMin: 180000,
    salaryMax: 260000,
    postedAt: new Date(Date.now() - 2 * 86400000),
    atsPlatform: "greenhouse",
    isActive: true,
    createdAt: new Date(),
    matchScore: 92,
    skillsOverlap: ["TypeScript", "Python", "Cloud Infrastructure", "System Design"],
    skillsGap: ["Rust"],
  },
  {
    id: "2",
    externalId: "lv-1",
    source: "lever",
    sourceUrl: "https://jobs.lever.co/stripe/5678",
    companyName: "Stripe",
    title: "Full Stack Engineer, Payments",
    description: "",
    location: "Remote (US)",
    isRemote: true,
    salaryMin: 170000,
    salaryMax: 240000,
    postedAt: new Date(Date.now() - 4 * 86400000),
    atsPlatform: "lever",
    isActive: true,
    createdAt: new Date(),
    matchScore: 85,
    skillsOverlap: ["React", "Node.js", "PostgreSQL"],
    skillsGap: ["Ruby", "Payments domain"],
  },
  {
    id: "3",
    externalId: "gh-2",
    source: "greenhouse",
    sourceUrl: "https://boards.greenhouse.io/vercel/jobs/9012",
    companyName: "Vercel",
    title: "Staff Engineer, Next.js",
    description: "",
    location: "Remote",
    isRemote: true,
    salaryMin: 200000,
    salaryMax: 300000,
    postedAt: new Date(Date.now() - 1 * 86400000),
    atsPlatform: "greenhouse",
    isActive: true,
    createdAt: new Date(),
    matchScore: 78,
    skillsOverlap: ["Next.js", "React", "TypeScript"],
    skillsGap: ["Webpack internals", "V8 engine"],
  },
  {
    id: "4",
    externalId: "lv-2",
    source: "lever",
    sourceUrl: "https://jobs.lever.co/notion/3456",
    companyName: "Notion",
    title: "Backend Engineer, AI Features",
    description: "",
    location: "New York, NY",
    isRemote: false,
    salaryMin: 160000,
    salaryMax: 220000,
    postedAt: new Date(Date.now() - 6 * 86400000),
    atsPlatform: "lever",
    isActive: true,
    createdAt: new Date(),
    matchScore: 71,
    skillsOverlap: ["Python", "LLMs", "PostgreSQL"],
    skillsGap: ["Kotlin"],
  },
  {
    id: "5",
    externalId: "gh-3",
    source: "greenhouse",
    sourceUrl: "https://boards.greenhouse.io/figma/jobs/7890",
    companyName: "Figma",
    title: "Product Engineer",
    description: "",
    location: "San Francisco, CA",
    isRemote: false,
    salaryMin: 175000,
    salaryMax: 250000,
    postedAt: new Date(Date.now() - 3 * 86400000),
    atsPlatform: "greenhouse",
    isActive: true,
    createdAt: new Date(),
    matchScore: 65,
    skillsOverlap: ["React", "TypeScript"],
    skillsGap: ["C++", "WebGL", "Design systems"],
  },
];

type FilterKey = "all" | "remote" | "80plus" | "60plus";

export default function JobFeedPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = DEMO_JOBS.filter((job) => {
    if (filter === "remote" && !job.isRemote) return false;
    if (filter === "80plus" && job.matchScore < 80) return false;
    if (filter === "60plus" && job.matchScore < 60) return false;
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && !job.companyName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Job Feed</h1>
        <p className="text-slate-400 text-sm mt-1">
          {filtered.length} jobs matched to your profile · Updated every 6 hours
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        {(["all", "remote", "80plus", "60plus"] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filter === f
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500"
            }`}
          >
            {f === "all" ? "All" : f === "remote" ? "Remote" : f === "80plus" ? "80+" : "60+"}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            matchScore={job.matchScore}
            skillsOverlap={job.skillsOverlap}
            skillsGap={job.skillsGap}
            onApply={() => alert(`Agent would apply to ${job.companyName} — ${job.title}`)}
            onSave={() => alert("Saved!")}
            onSkip={() => alert("Skipped")}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>No jobs match your current filters.</p>
        </div>
      )}
    </div>
  );
}
