import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Flame, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Card } from "../../components/Card";
import { DailyChallenge } from "../../components/DailyChallenge";
import { ProgressBar } from "../../components/ProgressBar";
import { Skeleton } from "../../components/Skeleton";
import { api } from "../../lib/api";

type ProfileResponse = {
  ok: true;
  profile: {
    xp: number;
    level: number;
    levelStartXp: number;
    nextLevelXp: number;
    streak: number;
  };
};

export function Home() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);

  // Always fetch fresh, so XP and streak are correct after a lesson.
  const query = useQuery({
    queryKey: ["community", "profile"],
    queryFn: () => api<ProfileResponse>("/api/community/profile"),
    staleTime: 0,
  });

  const p = query.data?.profile;
  const span = p ? p.nextLevelXp - p.levelStartXp : 1;
  const percent = p ? ((p.xp - p.levelStartXp) / span) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("engage.home.greeting", { name: user?.name ?? "" })}</h1>
        <p className="text-muted">{t("engage.home.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-3">
          {p ? (
            <>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{t("engage.home.level", { level: p.level })}</p>
                <p className="text-sm text-muted">{t("engage.profile.xp", { xp: p.xp })}</p>
              </div>
              <ProgressBar value={percent} label={t("engage.home.level", { level: p.level })} />
              <p className="text-sm text-muted">
                {t("engage.home.xpToNext", { xp: p.nextLevelXp - p.xp, next: p.level + 1 })}
              </p>
            </>
          ) : (
            <>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </>
          )}
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
            <Flame size={24} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted">{t("engage.home.streak")}</p>
            {p ? (
              <p className="text-xl font-semibold">{t("engage.home.streakDays", { count: p.streak })}</p>
            ) : (
              <Skeleton className="mt-1 h-6 w-20" />
            )}
          </div>
        </Card>
      </div>

      <DailyChallenge />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/learn" className="block rounded-card">
          <Card className="flex items-center justify-between transition-colors hover:bg-soft">
            <span className="font-medium">{t("engage.home.continueLearning")}</span>
            <ChevronRight size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
          </Card>
        </Link>
        <Link to="/leaderboard" className="block rounded-card">
          <Card className="flex items-center justify-between transition-colors hover:bg-soft">
            <span className="inline-flex items-center gap-2 font-medium">
              <Trophy size={18} strokeWidth={1.75} aria-hidden="true" />
              {t("engage.leaderboard.title")}
            </span>
            <ChevronRight size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
          </Card>
        </Link>
      </div>
    </div>
  );
}