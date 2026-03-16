import { formatSalary, timeAgo } from "@/lib/utils";
import type { Job } from "@/types";
import { MatchScoreBadge } from "./match-score-badge";

interface JobCardProps {
  job: Job;
  matchScore?: number;
  skillsOverlap?: string[];
  skillsGap?: string[];
  onApply?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
  applied?: boolean;
}

export function JobCard({
  job,
  matchScore,
  skillsOverlap = [],
  skillsGap = [],
  onApply,
  onSave,
  onSkip,
  applied,
}: JobCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{job.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-blue-400 text-sm font-medium">{job.companyName}</span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-sm">{job.location}</span>
            {job.isRemote && (
              <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                Remote
              </span>
            )}
          </div>
        </div>
        {matchScore !== undefined && <MatchScoreBadge score={matchScore} />}
      </div>

      {/* Salary + time */}
      <div className="flex items-center gap-3 text-sm mb-4">
        <span className="text-slate-300">{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">{job.postedAt ? timeAgo(job.postedAt) : "Recently"}</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-500 text-xs capitalize">{job.source}</span>
      </div>

      {/* Skills */}
      {skillsOverlap.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skillsOverlap.slice(0, 5).map((s) => (
            <span key={s} className="bg-blue-500/10 text-blue-300 text-xs px-2 py-1 rounded-md border border-blue-500/20">
              {s}
            </span>
          ))}
          {skillsGap.slice(0, 3).map((s) => (
            <span key={s} className="bg-orange-500/10 text-orange-300 text-xs px-2 py-1 rounded-md border border-orange-500/20">
              ⚠ {s}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        {applied ? (
          <span className="text-green-400 text-sm font-medium">✓ Applied</span>
        ) : (
          <>
            <button
              onClick={onApply}
              className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Apply with agent
            </button>
            <button
              onClick={onSave}
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={onSkip}
              className="text-slate-500 hover:text-slate-300 text-sm px-3 py-2 transition-colors"
            >
              Skip
            </button>
          </>
        )}
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          View original ↗
        </a>
      </div>
    </div>
  );
}
