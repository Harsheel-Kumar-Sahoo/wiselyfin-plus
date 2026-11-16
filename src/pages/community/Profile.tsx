import { useQuery } from "@tanstack/react-query";
import { BookOpen, Coins, Flame, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { cx } from "../../components/cx";
import { EmptyState } from "../../components/EmptyState";
import { ProgressBar } from "../../components/ProgressBar";
import { Skeleton } from "../../components/Skeleton";
import { api } from "../../lib/api";
import { pathIcon } from "../../lib/icons";

type ProfileResponse = {
  ok: true;
  profile: {
    name: string;
    email: string;
    joinedAt: string;
    xp: number;
    level: number;
    levelStartXp: number;
    nextLevelXp: number;
    streak: number;
    finCoins: number;
    lessonsPassed: number;
  };
  badges: Array<{ id: string; icon: string; earned: boolean; earnedAt: string | null }>;
};

export function Profile() {
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["community", "profile"],
    queryFn: () => api<ProfileResponse>("/api/community/profile"),
    staleTime: 0,
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <EmptyState
          icon={WifiOff}
          title={t("common.errorTitle")}
          description={t("common.errorBody")}
          action={<Button onClick={() => void query.refetch()}>{t("common.retry")}</Button>}
        />
      </Card>
    );
  }

  const { profile: p, badges } = query.data;
  const percent = ((p.xp - p.levelStartXp) / (p.nextLevelXp - p.levelStartXp)) * 100;
  const earnedCount = badges.filter((b) => b.earned).length;
  const joined = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(p.joinedAt));

  const stats = [
    { icon: Flame, label: t("engage.profile.streak"), value: String(p.streak), coin: false },
    { icon: BookOpen, label: t("engage.profile.lessons"), value: String(p.lessonsPassed), coin: false },
    { icon: Coins, label: t("engage.profile.coins"), value: p.finCoins.toLocaleString(i18n.language), coin: true },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="text-sm text-muted">{t("engage.profile.joined", { date: joined })}</p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{t("engage.profile.level", { level: p.level })}</p>
          <p className="text-sm text-muted">{t("engage.profile.xp", { xp: p.xp })}</p>
        </div>
        <ProgressBar value={percent} label={t("engage.profile.level", { level: p.level })} />
        <p className="text-sm text-muted">{t("engage.home.xpToNext", { xp: p.nextLevelXp - p.xp, next: p.level + 1 })}</p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, coin }) => (
          <Card key={label} className="space-y-1 p-4 text-center sm:p-4">
            <Icon size={20} strokeWidth={1.75} className={cx("mx-auto", coin ? "text-coin" : "text-accent")} aria-hidden="true" />
            <p className={cx("text-xl font-semibold", coin && "text-coin")}>{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("engage.profile.badges")}</h2>
        <Badge tone="neutral">{t("engage.profile.earned", { count: earnedCount, total: badges.length })}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => {
          const Icon = pathIcon(b.icon);
          return (
            <Card
              key={b.id}
              className={cx("space-y-2 p-4 text-center sm:p-4", !b.earned && "opacity-50")}
              aria-label={`${t(`engage.badge.${b.id}`)}${b.earned ? "" : `: ${t("engage.profile.locked")}`}`}
            >
              <div
                className={cx(
                  "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
                  b.earned ? "bg-accent-soft text-accent" : "bg-soft text-muted"
                )}
              >
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <p className="text-sm font-medium">{t(`engage.badge.${b.id}`)}</p>
              {!b.earned ? <p className="text-xs text-muted">{t("engage.profile.locked")}</p> : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}