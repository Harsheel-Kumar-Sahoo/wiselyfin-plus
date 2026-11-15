import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ProgressBar } from "../../components/ProgressBar";
import { Skeleton } from "../../components/Skeleton";
import { api } from "../../lib/api";
import { pathIcon } from "../../lib/icons";

type PathItem = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  completionCoins: number;
  totalLessons: number;
  completedLessons: number;
};

export function Learn() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const query = useQuery({
    queryKey: ["learn", "paths", lang],
    queryFn: () => api<{ ok: true; paths: PathItem[] }>(`/api/learn/paths?lang=${lang}`),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("learn.title")}</h1>
        <p className="text-muted">{t("learn.subtitle")}</p>
      </div>

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : query.isError ? (
        <Card>
          <EmptyState
            icon={WifiOff}
            title={t("common.errorTitle")}
            description={t("common.errorBody")}
            action={<Button onClick={() => void query.refetch()}>{t("common.retry")}</Button>}
          />
        </Card>
      ) : query.data && query.data.paths.length === 0 ? (
        <Card>
          <EmptyState icon={BookOpen} title={t("learn.noPaths")} />
        </Card>
      ) : (
        <div className="space-y-4">
          {query.data?.paths.map((p) => {
            const Icon = pathIcon(p.icon);
            const percent = p.totalLessons === 0 ? 0 : (p.completedLessons / p.totalLessons) * 100;
            const action =
              p.completedLessons === 0
                ? t("learn.start")
                : p.completedLessons >= p.totalLessons
                  ? t("learn.review")
                  : t("learn.continue");
            return (
              <Link key={p.slug} to={`/learn/${p.slug}`} className="block rounded-card">
                <Card className="space-y-4 transition-colors hover:bg-soft">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
                      <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="text-lg font-semibold">{p.title}</h2>
                      <p className="text-sm text-muted">{p.description}</p>
                    </div>
                  </div>
                  <ProgressBar value={percent} label={p.title} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {t("learn.lessonsDone", { done: p.completedLessons, total: p.totalLessons })}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-accent">
                      {action}
                      <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}