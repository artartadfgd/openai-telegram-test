"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  WandSparkles,
  Users,
  UserRound,
  History,
  Settings,
  LogOut,
  BookOpen,
  CalendarRange,
  CalendarClock,
  Star,
  CircleUserRound,
} from "lucide-react";
import { Brandmark } from "@/components/brandmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; initials: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const NAV_SECTIONS = [
    {
      title: t.nav.work,
      items: [
        { to: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
        { to: "/ai-coach", label: t.nav.aiCoach, icon: Sparkles },
        { to: "/training-builder", label: t.nav.trainingBuilder, icon: WandSparkles },
        { to: "/library", label: t.nav.library, icon: BookOpen },
      ],
    },
    {
      title: t.nav.planning,
      items: [
        { to: "/teams", label: t.nav.teams, icon: Users },
        { to: "/players", label: t.nav.players, icon: UserRound },
        { to: "/calendar", label: t.nav.calendar, icon: CalendarRange },
        { to: "/season", label: t.nav.season, icon: CalendarClock },
        { to: "/favorites", label: t.nav.favorites, icon: Star },
        { to: "/history", label: t.nav.history, icon: History },
      ],
    },
    {
      title: t.nav.account,
      items: [
        { to: "/profile", label: t.nav.profile, icon: CircleUserRound },
        { to: "/settings", label: t.nav.settings, icon: Settings },
      ],
    },
  ];

  const MOBILE_NAV = [
    { to: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/ai-coach", label: t.nav.aiCoach, icon: Sparkles },
    { to: "/training-builder", label: t.nav.trainingBuilder, icon: WandSparkles },
    { to: "/teams", label: t.nav.teams, icon: Users },
    { to: "/settings", label: t.nav.settings, icon: Settings },
  ];

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-14 items-center px-4">
          <Link href="/dashboard" className="transition-opacity duration-150 hover:opacity-80">
            <Brandmark />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mt-4 first:mt-2">
              <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{section.title}</div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <li key={item.to}>
                      <Link
                        href={item.to}
                        className={
                          "relative flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 " +
                          (active
                            ? "bg-accent text-accent-foreground before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r-full before:bg-primary"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground")
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-2.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {user.initials || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.name || "—"}</div>
              <div className="truncate text-[11px] text-muted-foreground">{t.nav.role}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher compact />
            </div>
            <button
              type="button"
              onClick={signOut}
              title={t.nav.signOut}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">{t.nav.signOut}</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <Brandmark />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={signOut}
              title={t.nav.signOut}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
          <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
            {MOBILE_NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <li key={item.to} className="flex-1">
                  <Link
                    href={item.to}
                    className={
                      "flex flex-col items-center justify-center gap-0.5 px-2 py-2 text-[10px] transition-colors duration-150 " +
                      (active ? "text-primary" : "text-muted-foreground")
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
