/**
 * Agent orchestrator — the core application loop
 * Steps: Research → Tailor → Cover Letter → Review Gate → Submit → Track
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AgentInput {
  jobId: string;
  userId: string;
  applicationId: string;
  job: {
    title: string;
    companyName: string;
    companyUrl?: string;
    description: string;
    sourceUrl: string;
  };
  profile: {
    parsedResume: object;
    jobTitles: string[];
    skills: string[];
  };
}

export interface AgentOutput {
  companyResearch: CompanyResearch;
  tailoredResume: TailoredResume;
  coverLetter: string;
  screeningAnswers: Record<string, string>;
  readyForReview: boolean;
}

export interface CompanyResearch {
  summary: string;
  recentNews: string[];
  culture: string;
  techStack: string[];
  whyThisCompany: string;
}

export interface TailoredResume {
  summary: string;
  highlights: string[];  // reordered/reworded bullets
  keywordsAdded: string[];
  keywordsRemoved: string[];
}

export async function runAgentLoop(input: AgentInput): Promise<AgentOutput> {
  console.log(`[Agent] Starting loop for ${input.job.companyName} - ${input.job.title}`);

  // Step 1: Research
  const companyResearch = await researchCompany(input.job);

  // Step 2: Tailor resume
  const tailoredResume = await tailorResume(input.job, input.profile, companyResearch);

  // Step 3: Generate cover letter
  const coverLetter = await generateCoverLetter(input.job, input.profile, companyResearch);

  // Step 4: Ready for human review (always true — review gate is default ON)
  return {
    companyResearch,
    tailoredResume,
    coverLetter,
    screeningAnswers: {},
    readyForReview: true,
  };
}

async function researchCompany(job: AgentInput["job"]): Promise<CompanyResearch> {
  const prompt = `Research this company and role for a job application.

Company: ${job.companyName}
Role: ${job.title}
Job Description: ${job.description.slice(0, 2000)}

Provide:
1. A 2-3 sentence company summary
2. Any notable recent news or developments
3. Company culture signals from the JD
4. Tech stack mentioned or implied
5. A compelling "why this company" talking point for the candidate

Respond as JSON matching this shape:
{
  "summary": "...",
  "recentNews": ["..."],
  "culture": "...",
  "techStack": ["..."],
  "whyThisCompany": "..."
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { summary: "", recentNews: [], culture: "", techStack: [], whyThisCompany: "" };
  }
}

async function tailorResume(
  job: AgentInput["job"],
  profile: AgentInput["profile"],
  research: CompanyResearch
): Promise<TailoredResume> {
  const prompt = `You are a professional resume tailor. Given a job description and candidate profile, rewrite the candidate's resume summary and highlight their most relevant experience bullets.

Job: ${job.title} at ${job.companyName}
Description: ${job.description.slice(0, 3000)}
Company tech stack: ${research.techStack.join(", ")}

Candidate profile:
${JSON.stringify(profile.parsedResume, null, 2).slice(0, 2000)}

Rules:
- Keep bullets truthful — reorder and reword, never fabricate
- Lead with impact/metrics when possible
- Inject relevant keywords from the JD naturally
- Max 3 highlights

Respond as JSON:
{
  "summary": "2-3 sentence tailored professional summary",
  "highlights": ["bullet 1", "bullet 2", "bullet 3"],
  "keywordsAdded": ["keyword1", "keyword2"],
  "keywordsRemoved": []
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return { summary: "", highlights: [], keywordsAdded: [], keywordsRemoved: [] };
  }
}

async function generateCoverLetter(
  job: AgentInput["job"],
  profile: AgentInput["profile"],
  research: CompanyResearch
): Promise<string> {
  const prompt = `Write a concise, compelling cover letter for this job application.

Role: ${job.title} at ${job.companyName}
Why this company: ${research.whyThisCompany}
Company culture: ${research.culture}
Candidate background: ${JSON.stringify(profile.parsedResume).slice(0, 1000)}

Rules:
- 3 short paragraphs max
- Hook with something specific about the company (not generic praise)
- Middle: 2 concrete accomplishments relevant to the role
- Close: clear ask + enthusiasm
- No clichés ("I am writing to express my interest...")
- Sound like a human, not a template`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
