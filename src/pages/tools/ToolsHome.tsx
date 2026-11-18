import {
  BadgeIndianRupee,
  Bot,
  Calculator,
  Landmark,
  LineChart,
  PiggyBank,
  Receipt,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card } from "../../components/Card";

const TRACKERS: Array<{ to: string; titleKey: string; descKey: string; icon: LucideIcon }> = [
  { to: "/tutor", titleKey: "tutor.title", descKey: "tutor.subtitle", icon: Bot },
  { to: "/budget", titleKey: "budget.title", descKey: "budget.subtitle", icon: Wallet },
  { to: "/stocks", titleKey: "stocks.title", descKey: "stocks.subtitle", icon: TrendingUp },
];

const CALCULATORS: Array<{ to: string; key: string; icon: LucideIcon }> = [
  { to: "/tools/sip", key: "sip", icon: LineChart },
  { to: "/tools/emi", key: "emi", icon: Landmark },
  { to: "/tools/compound", key: "compound", icon: Calculator },
  { to: "/tools/fd", key: "fd", icon: PiggyBank },
  { to: "/tools/rd", key: "rd", icon: BadgeIndianRupee },
  { to: "/tools/tax", key: "tax", icon: Receipt },
];

export function ToolsHome() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("tools.title")}</h1>
        <p className="text-muted">{t("tools.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TRACKERS.map(({ to, titleKey, descKey, icon: Icon }) => (
          <Link key={to} to={to} className="block rounded-card">
            <Card className="flex h-full items-start gap-4 transition-colors hover:bg-soft">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t(titleKey)}</h3>
                <p className="text-sm text-muted">{t(descKey)}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold">{t("tools.calculators")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {CALCULATORS.map(({ to, key, icon: Icon }) => (
          <Link key={to} to={to} className="block rounded-card">
            <Card className="flex h-full items-start gap-4 transition-colors hover:bg-soft">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t(`tools.${key}.name`)}</h3>
                <p className="text-sm text-muted">{t(`tools.${key}.desc`)}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}