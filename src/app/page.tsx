export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">ClawMatch</span>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">Beta</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-slate-300 hover:text-white transition-colors text-sm">Sign in</a>
          <a href="/signup" className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Get early access
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 pt-20 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Actively finding jobs for early users
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
          Your AI Career Agent.{" "}
          <span className="text-blue-400">Not a bot.</span>
        </h1>

        <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
          Your agent applies. You interview.
        </p>
        <p className="text-slate-400 mb-12 max-w-xl mx-auto">
          ClawMatch finds jobs from 175,000+ company career pages, tailors your resume per application, and submits — while you focus on preparing for interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/signup" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105">
            Start for free →
          </a>
          <a href="#how-it-works" className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg transition-colors">
            See how it works
          </a>
        </div>

        <p className="text-slate-500 text-sm mt-6">No credit card required · Free tier includes 10 applications/month</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-700/50 bg-slate-800/30 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center px-4">
          <div>
            <div className="text-3xl font-bold text-blue-400">175k+</div>
            <div className="text-slate-400 text-sm mt-1">Company career pages indexed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">42</div>
            <div className="text-slate-400 text-sm mt-1">ATS platforms covered</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">15%+</div>
            <div className="text-slate-400 text-sm mt-1">Interview rate (vs 3-5% spray-and-pray)</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">How ClawMatch works</h2>
        <p className="text-slate-400 text-center mb-16">20 perfect applications beat 750 generic ones.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload your resume",
              desc: "Takes 10 minutes. We parse your skills, experience, and goals into your Job DNA profile.",
            },
            {
              step: "02",
              title: "Agent hunts 24/7",
              desc: "Your agent scans 175k+ company career pages and scores every job against your profile. Updated every 6 hours.",
            },
            {
              step: "03",
              title: "Review, then launch",
              desc: "See the tailored resume and cover letter your agent prepared. Approve it, and it submits. You get the interview.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
              <div className="text-blue-400 font-mono text-sm mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-16 pb-32">
        <h2 className="text-4xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-slate-400 text-center mb-16">Start free. Upgrade when you land interviews.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Free",
              price: "$0",
              period: "/month",
              features: ["10 applications/month", "Basic job matching", "Application tracker"],
              cta: "Get started free",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$29",
              period: "/month",
              features: ["Unlimited applications (20/day max)", "AI resume tailoring per job", "AI cover letter generation", "Company research per application", "Interview prep", "Follow-up agent"],
              cta: "Start Pro",
              highlight: true,
            },
            {
              name: "Executive",
              price: "$99",
              period: "/month",
              features: ["Everything in Pro", "Deep company research", "LinkedIn profile optimization brief", "Priority matching queue", "White-glove mode"],
              cta: "Go Executive",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30"
                  : "bg-slate-800/50 border-slate-700"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs text-blue-400 font-medium mb-3 uppercase tracking-wider">Most popular</div>
              )}
              <div className="text-xl font-semibold mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className={`block text-center py-3 rounded-xl font-medium transition-colors ${
                  plan.highlight
                    ? "bg-blue-500 hover:bg-blue-400 text-white"
                    : "border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 ClawMatch · <a href="https://getclawmatch.com" className="hover:text-slate-300">getclawmatch.com</a></p>
      </footer>
    </main>
  );
}
