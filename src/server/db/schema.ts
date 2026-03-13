import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  real,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const planEnum = pgEnum("plan", ["free", "pro", "executive"]);
export const remoteEnum = pgEnum("remote_preference", ["remote", "hybrid", "onsite", "any"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending_review", "approved", "applying", "applied",
  "viewed", "interviewing", "rejected", "offer", "failed",
]);
export const matchStatusEnum = pgEnum("match_status", ["new", "saved", "applied", "skipped"]);
export const scrapeStatusEnum = pgEnum("scrape_status", ["running", "completed", "failed"]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  plan: planEnum("plan").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profiles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  resumeUrl: text("resume_url"),
  parsedResume: jsonb("parsed_resume"),
  jobTitles: text("job_titles").array(),
  industries: text("industries").array(),
  locations: text("locations").array(),
  remotePreference: remoteEnum("remote_preference").default("any"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  companySize: text("company_size").array(),
  dealBreakers: text("deal_breakers").array(),
  // embedding stored as text (pgvector handled via raw SQL)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id"),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  companyName: text("company_name").notNull(),
  companyUrl: text("company_url"),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  isRemote: boolean("is_remote").default(false),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  postedAt: timestamp("posted_at"),
  expiresAt: timestamp("expires_at"),
  atsPlatform: text("ats_platform"),
  rawData: jsonb("raw_data"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sourceExternalIdx: unique().on(table.source, table.externalId),
  activePostedIdx: index("idx_jobs_active").on(table.isActive, table.postedAt),
}));

// Matches
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  score: real("score").notNull(),
  skillsOverlap: jsonb("skills_overlap"),
  skillsGap: jsonb("skills_gap"),
  redFlags: text("red_flags").array(),
  status: matchStatusEnum("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userJobUnique: unique().on(table.userId, table.jobId),
  userScoreIdx: index("idx_matches_user_score").on(table.userId, table.score),
}));

// Applications
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id),
  matchId: uuid("match_id").references(() => matches.id),
  status: applicationStatusEnum("status").default("pending_review"),
  tailoredResume: jsonb("tailored_resume"),
  coverLetter: text("cover_letter"),
  companyResearch: jsonb("company_research"),
  submissionScreenshot: text("submission_screenshot"),
  submittedAt: timestamp("submitted_at"),
  followUpAt: timestamp("follow_up_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scrape runs
export const scrapeRuns = pgTable("scrape_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  jobsFound: integer("jobs_found").default(0),
  jobsNew: integer("jobs_new").default(0),
  jobsUpdated: integer("jobs_updated").default(0),
  errors: jsonb("errors"),
  status: scrapeStatusEnum("status").default("running"),
});
