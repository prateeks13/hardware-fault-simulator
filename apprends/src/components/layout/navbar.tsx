"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, BookOpen, Headphones, PenTool, LayoutDashboard, User, LogOut, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
  streak?: number;
}

const NAV_LINKS = [
  { href: "/learn/reading",   label: "Reading",   icon: BookOpen    },
  { href: "/learn/listening", label: "Listening", icon: Headphones  },
  { href: "/learn/writing",   label: "Writing",   icon: PenTool     },
];

export function Navbar({ session, streak = 0 }: NavbarProps) {
  const [open, setOpen]   = useState(false);
  const pathname           = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700 dark:text-brand-400">
          <span className="text-2xl">🇫🇷</span>
          <span>Apprends</span>
        </Link>

        {/* Desktop nav */}
        {session && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Streak badge */}
              {streak > 0 && (
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                  <Flame size={14} className="animate-flame-pulse" />
                  {streak}
                </div>
              )}
              <Link href="/account" className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">
                {session.user?.image
                  ? <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
                  : <User size={16} />}
                <span className="hidden lg:inline">{session.user?.name?.split(" ")[0]}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden sm:flex"
              >
                <LogOut size={14} />
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signin"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link href="/signup"><Button size="sm">Get started</Button></Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950 px-4 py-4 space-y-1">
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                <User size={16} /> Account
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Sign in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50">Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
