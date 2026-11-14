import { BookOpen, Calculator, House, LogOut, Moon, Sun, User, Wallet, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../theme/useTheme";
import { Button } from "./Button";
import { cx } from "./cx";
import { LanguageSelect } from "./LanguageSelect";

type NavItem = { to: string; labelKey: string; icon: LucideIcon; end?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: House, end: true },
  { to: "/learn", labelKey: "nav.learn", icon: BookOpen },
  { to: "/tools", labelKey: "nav.tools", icon: Calculator },
  { to: "/wallet", labelKey: "nav.wallet", icon: Wallet },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

export function AppShell() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Left sidebar: desktop only */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface p-4 md:flex">
        <div className="px-3 py-4 text-lg font-semibold">{t("app.name")}</div>
        <nav aria-label={t("common.mainNav")} className="mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors",
                  isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-soft hover:text-ink"
                )
              }
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-bg px-4 py-3">
          <span className="font-semibold md:hidden">{t("app.name")}</span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSelect />
            <Button variant="ghost" size="sm" onClick={toggle} aria-label={t("common.switchTheme")}>
              {theme === "light" ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void logout()} aria-label={t("auth.logout")}>
              <LogOut size={18} strokeWidth={1.75} />
            </Button>
          </div>
        </header>

        {user && !user.emailVerified ? (
          <div className="border-b border-line bg-accent-soft px-4 py-2 text-sm text-accent">
            {t("auth.verifyBanner")}
          </div>
        ) : null}

        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar: phones only */}
      <nav
        aria-label={t("common.mainNav")}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface md:hidden"
      >
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
                isActive ? "text-accent" : "text-muted"
              )
            }
          >
            <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}