"use client";

export default function MatchesPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Matches</h1>
        <p className="text-slate-400 text-sm mt-1">Jobs your agent scored as strong matches</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">⭐</div>
        <h2 className="text-lg font-semibold mb-2">No matches yet</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Upload your resume and set your preferences in your profile.
          Your agent will start finding matches within minutes.
        </p>
        <a href="/profile" className="inline-block mt-6 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          Set up profile →
        </a>
      </div>
    </div>
  );
}
