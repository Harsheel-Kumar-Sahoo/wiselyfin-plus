import { useQuery } from "@tanstack/react-query";
import { Coins, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { api } from "../../lib/api";

type WalletResponse = {
  ok: true;
  balance: number;
  xp: number;
  entries: Array<{
    id: string;
    amount: number;
    balanceAfter: number;
    reason: string;
    createdAt: string;
  }>;
};

function reasonKey(reason: string): string {
  if (reason === "lesson_reward" || reason === "path_completion") return `wallet.reason.${reason}`;
  if (reason === "streak_reward" || reason === "challenge_reward") return `wallet_extra.${reason}`;
  return "wallet.reason.other";
}

export function Wallet() {
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api<WalletResponse>("/api/wallet"),
  });

  const dateFormat = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("wallet.title")}</h1>
        <p className="text-muted">{t("wallet.subtitle")}</p>
      </div>

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
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
          <Card className="space-y-2">
            <p className="text-sm text-muted">{t("wallet.balance")}</p>
            <p className="text-4xl font-semibold text-coin">
              {query.data.balance.toLocaleString(i18n.language)}{" "}
              <span className="text-lg font-medium">{t("coins.finCoins")}</span>
            </p>
            <Badge tone="accent">{t("wallet.xp", { xp: query.data.xp })}</Badge>
          </Card>

          <h2 className="text-lg font-semibold">{t("wallet.history")}</h2>

          {query.data.entries.length === 0 ? (
            <Card>
              <EmptyState
                icon={Coins}
                title={t("wallet.empty")}
                action={
                  <Link to="/learn">
                    <Button>{t("wallet.goLearn")}</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {query.data.entries.map((e) => {
                const positive = e.amount >= 0;
                return (
                  <Card key={e.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{t(reasonKey(e.reason))}</p>
                      <p className="text-sm text-muted">{dateFormat.format(new Date(e.createdAt))}</p>
                    </div>
                    <div className="text-right">
                      <p className={positive ? "font-semibold text-coin" : "font-semibold text-error"}>
                        {positive ? "+" : ""}
                        {e.amount.toLocaleString(i18n.language)}
                      </p>
                      <p className="text-xs text-muted">
                        {t("wallet.balanceAfter", { balance: e.balanceAfter.toLocaleString(i18n.language) })}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}