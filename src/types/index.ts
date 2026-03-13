export type Plan = "free" | "pro" | "executive";

export type RemotePreference = "remote" | "hybrid" | "onsite" | "any";

export type ApplicationStatus =
  | "pending_review"
  | "approved"
  | "applying"
  | "applied"
  | "viewed"
  | "interviewing"
  | "rejected"
  | "offer"
  | "failed";

export type JobSource =
  | "greenhouse"
  | "lever"
  | "workday"
  | "ashby"
  | "rippling"
  | "wellfound"
  | "remoteok"
  | "usajobs"
  | "career_page"
  | "other";

export interface Job {
  id: string;
  externalId: string;
  source: JobSource;
  sourceUrl: string;
  companyName: string;
  companyUrl?: string;
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  postedAt?: Date;
  atsPlatform?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Match {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  score: number;
  skillsOverlap: string[];
  skillsGap: string[];
  redFlags: string[];
  status: "new" | "saved" | "applied" | "skipped";
  createdAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  status: ApplicationStatus;
  tailoredResume?: object;
  coverLetter?: string;
  companyResearch?: object;
  submissionScreenshot?: string;
  submittedAt?: Date;
  followUpAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  resumeUrl?: string;
  parsedResume?: object;
  jobTitles: string[];
  industries: string[];
  locations: string[];
  remotePreference: RemotePreference;
  salaryMin?: number;
  salaryMax?: number;
  companySize: string[];
  dealBreakers: string[];
  createdAt: Date;
  updatedAt: Date;
}
