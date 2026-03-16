"use client";

export default function InterviewPrepPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Interview Prep</h1>
        <p className="text-slate-400 text-sm mt-1">AI-generated prep when you get a callback</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-lg font-semibold mb-2">No interviews scheduled yet</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          When you land an interview, your agent will auto-generate a company brief,
          likely questions, and STAR-format answer templates.
        </p>
        <a href="/" className="inline-block mt-6 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          Browse jobs →
        </a>
      </div>
    </div>
  );
}
