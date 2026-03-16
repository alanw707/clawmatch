export function MatchScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const color =
    score >= 80 ? "text-green-400 border-green-500/30 bg-green-500/10" :
    score >= 60 ? "text-blue-400 border-blue-500/30 bg-blue-500/10" :
    score >= 40 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
    "text-slate-400 border-slate-500/30 bg-slate-500/10";

  const sizeClasses = size === "sm" ? "w-10 h-10 text-sm" : "w-14 h-14 text-lg";

  return (
    <div className={`${sizeClasses} ${color} rounded-full border-2 flex items-center justify-center font-bold`}>
      {Math.round(score)}
    </div>
  );
}
