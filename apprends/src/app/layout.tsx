import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default:  "Apprends — Learn French for TEF & DELF",
    template: "%s | Apprends",
  },
  description: "Master French with AI-powered lessons, mock exams, and gamified practice. Prepare for TEF and DELF with reading, listening, and writing exercises.",
  keywords: ["French learning", "TEF exam", "DELF exam", "learn French online"],
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  let streak = 0;
  if (session?.user?.id) {
    try {
      const progress = await db.progress.findMany({
        where: { userId: session.user.id },
        select: { streakCount: true },
      });
      streak = Math.max(...progress.map((p) => p.streakCount), 0);
    } catch {
      // DB not available during build
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Providers session={session}>
          <Navbar session={session} streak={streak} />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950">
            <p>© {new Date().getFullYear()} Apprends. Built for French learners. 🇫🇷</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
