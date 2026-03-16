import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "ClawMatch <noreply@getclawmatch.com>",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // Upsert user in our DB
      await supabase.from("users").upsert(
        { email: user.email, name: user.name, avatar_url: user.image },
        { onConflict: "email", ignoreDuplicates: false }
      );
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const { data } = await supabase
          .from("users")
          .select("id, plan")
          .eq("email", session.user.email)
          .single();
        if (data) {
          (session.user as typeof session.user & { id: string; plan: string }).id = data.id;
          (session.user as typeof session.user & { id: string; plan: string }).plan = data.plan;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
