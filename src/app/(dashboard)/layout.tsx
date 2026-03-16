import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/server/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <Link href="/" className="text-xl font-bold tracking-tight">ClawMatch</Link>
          <div className="text-xs text-slate-400 mt-0.5">Your AI Career Agent</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem href="/" icon="🔍" label="Job Feed" />
          <NavItem href="/matches" icon="⭐" label="My Matches" />
          <NavItem href="/applications" icon="📋" label="Applications" />
          <NavItem href="/interview-prep" icon="🎯" label="Interview Prep" />
          <div className="pt-4 mt-4 border-t border-slate-800">
            <NavItem href="/profile" icon="👤" label="My Profile" />
            <NavItem href="/settings" icon="⚙️" label="Settings" />
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium">
                {session.user.name?.[0] ?? session.user.email?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{session.user.name ?? "User"}</div>
              <div className="text-xs text-slate-400 truncate">{session.user.email}</div>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
