"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [humanReview, setHumanReview] = useState(true);
  const [maxAppsPerDay, setMaxAppsPerDay] = useState(20);
  const [minMatchScore, setMinMatchScore] = useState(60);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Control how your agent behaves</p>
      </div>

      <div className="space-y-6">
        {/* Agent behavior */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-5">Agent Behavior</h2>
          <div className="space-y-5">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Human review gate</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Show me the tailored resume + cover letter before submitting
                </div>
              </div>
              <button
                onClick={() => setHumanReview(!humanReview)}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${humanReview ? "bg-blue-500" : "bg-slate-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${humanReview ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="border-t border-slate-700/50 pt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Max applications per day</div>
                <span className="text-blue-400 font-semibold">{maxAppsPerDay}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={maxAppsPerDay}
                onChange={(e) => setMaxAppsPerDay(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1</span><span>20 (max)</span>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Minimum match score</div>
                <span className="text-blue-400 font-semibold">{minMatchScore}</span>
              </div>
              <input
                type="range"
                min={40}
                max={90}
                step={5}
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>40</span><span>90</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Agent won&apos;t apply to jobs below this score unless you manually override.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold mb-5">Notifications</h2>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">Email notifications</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Get notified when agent applies, or when an application status changes
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${emailNotifications ? "bg-blue-500" : "bg-slate-600"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailNotifications ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Current Plan</h2>
              <p className="text-slate-400 text-sm mt-0.5">Free · 10 applications/month</p>
            </div>
            <a href="/settings/billing" className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
