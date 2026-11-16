import { useQuery } from "@tanstack/react-query";
import { Trophy, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { cx } from "../../components/cx";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { api } from "../../lib/api";

type LeaderboardResponse = {
  ok: true;
  top: Array<{ id: string; rank: number; name: string; xp: number; level: number; isMe: boolean }>;
  me: { xp: number; level: number; rank: number | null };
};

export function Leaderboard() {
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["community", "leaderboard"],
    queryFn: () => api<LeaderboardResponse>("/api/community/leaderboard"),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("engage.leaderboard.title")}</h1>
        <p className="text-muted">{t("engage.leaderboard.subtitle")}</p>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : query.isError || !query.data ? (
        <Card>
          <EmptyState
            icon={WifiOff}
            title={t("common.errorTitle")}
            description={t("common.errorBody")}
            action={<Button onClick={() => void query.refetch()}>{t("common.retry")}</Button>}
          />
        </Card>
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {query.data.me.rank
                ? t("engage.leaderboard.yourRank", { rank: query.data.me.rank })
                : t("engage.leaderboard.noRank")}
            </p>
            <Badge tone="accent">{t("engage.leaderboard.xp", { xp: query.data.me.xp })}</Badge>
          </Card>

          {query.data.top.length === 0 ? (
            <Card>
              <EmptyState icon={Trophy} title={t("engage.leaderboard.empty")} />
            </Card>
          ) : (
            <div className="space-y-3">
              {query.data.top.map((e) => (
                <Card
                  key={e.id}
                  className={cx("flex items-center gap-4", e.isMe && "border-accent bg-accent-soft")}
                >
                  <span className="w-8 shrink-0 text-center text-lg font-semibold text-muted">{e.rank}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {e.name}
                      {e.isMe ? ` (${t("engage.leaderboard.you")})` : ""}
                    </p>
                    <p className="text-sm text-muted">{t("engage.leaderboard.level", { level: e.level })}</p>
                  </div>
                  <p className="font-semibold">{t("engage.leaderboard.xp", { xp: e.xp.toLocaleString(i18n.language) })}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}