import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClawMatch — Your AI Career Agent",
  description: "Your agent applies. You interview. AI-powered job search that finds, matches, and applies to jobs on your behalf.",
  openGraph: {
    title: "ClawMatch — Your AI Career Agent",
    description: "Your agent applies. You interview.",
    url: "https://getclawmatch.com",
    siteName: "ClawMatch",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
