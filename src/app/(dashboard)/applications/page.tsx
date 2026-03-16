"use client";

import { MatchScoreBadge } from "@/components/match-score-badge";
import type { ApplicationStatus } from "@/types";
import { useState } from "react";

interface DemoApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  matchScore: number;
  appliedAt: Date;
  sourceUrl: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  pending_review: { label: "Pending Review", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: "👁️" },
  approved: { label: "Approved", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: "✅" },
  applying: { label: "Applying...", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: "⏳" },
  applied: { label: "Applied", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: "📬" },
  viewed: { label: "Viewed", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: "👀" },
  interviewing: { label: "Interviewing", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: "🎤" },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: "❌" },
  offer: { label: "Offer!", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: "🎉" },
  failed: { label: "Failed", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: "⚠️" },
};

const DEMO_APPS: DemoApplication[] = [
  { id: "1", company: "Anthropic", role: "Senior Software Engineer, Platform", status: "interviewing", matchScore: 92, appliedAt: new Date(Date.now() - 5 * 86400000), sourceUrl: "#" },
  { id: "2", company: "Stripe", role: "Full Stack Engineer, Payments", status: "applied", matchScore: 85, appliedAt: new Date(Date.now() - 3 * 86400000), sourceUrl: "#" },
  { id: "3", company: "Vercel", role: "Staff Engineer, Next.js", status: "pending_review", matchScore: 78, appliedAt: new Date(Date.now() - 1 * 86400000), sourceUrl: "#" },
  { id: "4", company: "Linear", role: "Backend Engineer", status: "viewed", matchScore: 74, appliedAt: new Date(Date.now() - 7 * 86400000), sourceUrl: "#" },
  { id: "5", company: "Notion", role: "Backend Engineer, AI Features", status: "rejected", matchScore: 71, appliedAt: new Date(Date.now() - 14 * 86400000), sourceUrl: "#" },
];

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  const filtered = DEMO_APPS.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  const stats = {
    total: DEMO_APPS.length,
    active: DEMO_APPS.filter((a) => ["applied", "viewed", "interviewing", "pending_review", "approved", "applying"].includes(a.status)).length,
    interviews: DEMO_APPS.filter((a) => a.status === "interviewing").length,
    responseRate: Math.round((DEMO_APPS.filter((a) => ["viewed", "interviewing", "offer"].includes(a.status)).length / DEMO_APPS.length) * 100),
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-slate-400 text-sm mt-1">Track every application your agent sends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applied", value: stats.total, icon: "📋" },
          { label: "Active", value: stats.active, icon: "🔄" },
          { label: "Interviews", value: stats.interviews, icon: "🎤" },
          { label: "Response Rate", value: `${stats.responseRate}%`, icon: "📊" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending_review", "applied", "viewed", "interviewing", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              statusFilter === s
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            {s === "all" ? `All (${DEMO_APPS.length})` : `${STATUS_CONFIG[s].icon} ${STATUS_CONFIG[s].label}`}
          </button>
        ))}
      </div>

      {/* Application list */}
      <div className="space-y-3">
        {filtered.map((app) => {
          const config = STATUS_CONFIG[app.status];
          return (
            <div key={app.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-4">
                <MatchScoreBadge score={app.matchScore} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{app.role}</div>
                  <div className="text-sm text-blue-400">{app.company}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-xs text-slate-500">
                  {app.appliedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">📋</div>
          <p>No applications with this status yet.</p>
        </div>
      )}
    </div>
  );
}
