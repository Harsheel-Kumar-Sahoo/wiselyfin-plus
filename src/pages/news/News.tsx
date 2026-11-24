import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { api } from "../../lib/api";

type NewsResponse = {
  ok: true;
  status: "fresh" | "older" | "unavailable";
  savedAt: string | null;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    image: string;
    source: string;
    publishedAt: string;
  }>;
};

export function News() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const query = useQuery({
    queryKey: ["news"],
    queryFn: () => api<NewsResponse>("/api/news"),
  });

  const timeFormat = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("news.title")}</h1>
        <p className="text-muted">{t("news.subtitle")}</p>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
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
      ) : query.data.status === "unavailable" || query.data.articles.length === 0 ? (
        <Card>
          <EmptyState
            icon={Newspaper}
            title={t("news.unavailableTitle")}
            description={t("news.unavailableBody")}
            action={<Button onClick={() => void query.refetch()}>{t("common.retry")}</Button>}
          />
        </Card>
      ) : (
        <>
          {query.data.status === "older" ? (
            <div role="status" className="rounded-control bg-accent-soft px-3 py-2 text-sm text-accent">
              {t("news.olderNotice")}
            </div>
          ) : null}
          {query.data.savedAt ? (
            <p className="text-xs text-muted">
              {t("news.updated", { time: timeFormat.format(new Date(query.data.savedAt)) })}
            </p>
          ) : null}

          <div className="space-y-3">
            {query.data.articles.map((a) => (
              <Card key={a.url} className="space-y-2">
                <p className="text-xs text-muted">
                  {a.source || t("news.unknownSource")}
                  {a.publishedAt ? ` - ${timeFormat.format(new Date(a.publishedAt))}` : ""}
                </p>
                <h2 className="font-semibold">{a.title}</h2>
                {a.description ? <p className="text-sm text-muted">{a.description}</p> : null}
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  {t("news.read")}
                  <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
                </a>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted">{t("news.disclaimer")}</p>
    </div>
  );
}