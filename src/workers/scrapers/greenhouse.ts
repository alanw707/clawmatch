/**
 * Greenhouse scraper
 * Greenhouse exposes a clean public JSON API for each company:
 * https://boards-api.greenhouse.io/v1/boards/{company}/jobs
 *
 * No auth required. Structured data. Best source to start with.
 */

const GREENHOUSE_COMPANIES = [
  "airbnb", "stripe", "notion", "figma", "anthropic", "openai",
  "vercel", "linear", "loom", "rippling", "brex", "gusto",
  "lattice", "retool", "airtable", "asana", "hubspot",
  // Add more as we grow the list
];

export interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string;
  location: { name: string };
  absolute_url: string;
  departments: { name: string }[];
  offices: { name: string; location: string }[];
}

export interface NormalizedJob {
  externalId: string;
  source: "greenhouse";
  sourceUrl: string;
  companyName: string;
  title: string;
  location: string;
  isRemote: boolean;
  postedAt: Date;
  atsPlatform: "greenhouse";
  rawData: object;
}

export async function scrapeGreenhouse(companySlug: string): Promise<NormalizedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`;

  const res = await fetch(url, {
    headers: { "User-Agent": "ClawMatch Job Aggregator (contact@getclawmatch.com)" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    console.warn(`[Greenhouse] Failed for ${companySlug}: ${res.status}`);
    return [];
  }

  const data = await res.json() as { jobs: GreenhouseJob[] };
  const jobs: NormalizedJob[] = [];

  for (const job of data.jobs ?? []) {
    const locationName = job.location?.name ?? "";
    const isRemote =
      locationName.toLowerCase().includes("remote") ||
      locationName.toLowerCase().includes("anywhere");

    jobs.push({
      externalId: `greenhouse-${companySlug}-${job.id}`,
      source: "greenhouse",
      sourceUrl: job.absolute_url,
      companyName: companySlug.charAt(0).toUpperCase() + companySlug.slice(1),
      title: job.title,
      location: locationName,
      isRemote,
      postedAt: new Date(job.updated_at),
      atsPlatform: "greenhouse",
      rawData: job,
    });
  }

  return jobs;
}

export async function scrapeAllGreenhouse(): Promise<NormalizedJob[]> {
  const results: NormalizedJob[] = [];
  const DELAY_MS = 500; // be a good citizen

  for (const company of GREENHOUSE_COMPANIES) {
    try {
      const jobs = await scrapeGreenhouse(company);
      results.push(...jobs);
      console.log(`[Greenhouse] ${company}: ${jobs.length} jobs`);
      await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (err) {
      console.error(`[Greenhouse] Error for ${company}:`, err);
    }
  }

  console.log(`[Greenhouse] Total: ${results.length} jobs from ${GREENHOUSE_COMPANIES.length} companies`);
  return results;
}
