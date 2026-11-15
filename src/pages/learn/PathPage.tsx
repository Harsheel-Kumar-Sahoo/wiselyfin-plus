import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Circle, CheckCircle2, SearchX, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { ApiError, api } from "../../lib/api";

type PathResponse = {
  ok: true;
  path: { slug: string; title: string; description: string; completionCoins: number };
  lessons: Array<{
    slug: string;
    title: string;
    rewardCoins: number;
    rewardXp: number;
    passed: boolean;
    bestScore: number;
  }>;
};

export function PathPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { slug = "" } = useParams();

  const query = useQuery({
    queryKey: ["learn", "path", slug, lang],
    queryFn: () => api<PathResponse>(`/api/learn/paths/${encodeURIComponent(slug)}?lang=${lang}`),
  });

  const notFound = query.error instanceof ApiError && query.error.status === 404;

  return (
    <div className="space-y-6">
      <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        {t("learn.title")}
      </Link>

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : notFound ? (
        <Card>
          <EmptyState icon={SearchX} title={t("learn.notFound")} />
        </Card>
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
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{query.data.path.title}</h1>
            <p className="text-muted">{query.data.path.description}</p>
          </div>

          <h2 className="text-lg font-semibold">{t("learn.lessons")}</h2>
          <div className="space-y-3">
            {query.data.lessons.map((lesson) => (
              <Link key={lesson.slug} to={`/learn/lesson/${lesson.slug}`} className="block rounded-card">
                <Card className="flex items-center gap-4 transition-colors hover:bg-soft">
                  {lesson.passed ? (
                    <CheckCircle2 size={24} strokeWidth={1.75} className="shrink-0 text-success" aria-label={t("learn.passed")} />
                  ) : (
                    <Circle size={24} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium">{lesson.title}</p>
                    {lesson.bestScore > 0 ? (
                      <p className="text-sm text-muted">{t("learn.bestScore", { score: lesson.bestScore })}</p>
                    ) : null}
                  </div>
                  <Badge tone="coin">{lesson.rewardCoins}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}