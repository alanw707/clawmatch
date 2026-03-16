"use client";

import { useState } from "react";

const REMOTE_OPTIONS = ["remote", "hybrid", "onsite", "any"] as const;
const COMPANY_SIZES = ["Startup (1-50)", "Mid-size (50-500)", "Large (500+)", "Enterprise (1000+)"];

export default function ProfilePage() {
  const [remotePreference, setRemotePreference] = useState("remote");
  const [jobTitles, setJobTitles] = useState("Senior Software Engineer, Staff Engineer");
  const [salaryMin, setSalaryMin] = useState("150000");
  const [salaryMax, setSalaryMax] = useState("250000");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your Job DNA — what your agent uses to find and apply to jobs
        </p>
      </div>

      <div className="space-y-6">
        {/* Resume */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Resume</h2>
          {resumeUploaded ? (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-green-400">✓</span>
              <span className="text-sm text-green-300">resume.pdf uploaded</span>
              <button onClick={() => setResumeUploaded(false)} className="ml-auto text-xs text-slate-400 hover:text-white">
                Replace
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => setResumeUploaded(true)}
            >
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-slate-300 font-medium">Drop your resume here</p>
              <p className="text-xs text-slate-500 mt-1">PDF or DOCX · max 5MB</p>
            </div>
          )}
        </div>

        {/* Target Roles */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Target Roles</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Job titles (comma-separated)</label>
              <input
                type="text"
                value={jobTitles}
                onChange={(e) => setJobTitles(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Work preference</label>
              <div className="flex gap-2">
                {REMOTE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setRemotePreference(opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      remotePreference === opt
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "border border-slate-600 text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Salary Range</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1.5">Minimum ($)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-slate-500 mt-5">—</span>
            <div className="flex-1">
              <label className="text-xs text-slate-400 block mb-1.5">Maximum ($)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Company Size */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Company Size</h2>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZES.map((size) => (
              <button
                key={size}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {saved ? "✓ Saved!" : "Save profile"}
        </button>
      </div>
    </div>
  );
}
