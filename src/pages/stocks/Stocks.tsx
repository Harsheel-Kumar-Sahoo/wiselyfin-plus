import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LineChart, WifiOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/Input";
import { Modal } from "../../components/Modal";
import { PnlChart } from "../../components/PnlChart";
import { Skeleton } from "../../components/Skeleton";
import { Tabs } from "../../components/Tabs";
import { useToast } from "../../components/Toast";
import { ApiError, api } from "../../lib/api";
import { errorMessage } from "../../lib/errorMessage";
import { inr } from "../../tools/format";

type Source = "delayed" | "simulated";

type QuotesResponse = {
  ok: true;
  asOf: string;
  quotes: Array<{ symbol: string; name: string; price: number; source: Source }>;
};

type PortfolioResponse = {
  ok: true;
  asOf: string;
  cash: number;
  holdingsValue: number;
  netWorth: number;
  totalPnl: number;
  unrealizedPnl: number;
  realizedPnl: number;
  holdings: Array<{
    symbol: string;
    name: string;
    qty: number;
    avgPrice: number;
    price: number;
    value: number;
    pnl: number;
    pnlPercent: number;
    source: Source;
  }>;
};

type TradesResponse = {
  ok: true;
  trades: Array<{
    id: string;
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    total: number;
    realized: number;
    source: Source;
    createdAt: string;
  }>;
};

type Selected = { symbol: string; name: string; price: number; side: "buy" | "sell" };

function pnlClass(value: number): string {
  return value > 0 ? "text-success" : value < 0 ? "text-error" : "text-ink";
}

function signed(value: number, lang: string): string {
  return `${value > 0 ? "+" : ""}${inr(value, lang)}`;
}

export function Stocks() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("market");
  const [selected, setSelected] = useState<Selected | null>(null);
  const [qty, setQty] = useState("1");
  const [error, setError] = useState("");

  const quotes = useQuery({
    queryKey: ["stocks", "quotes"],
    queryFn: () => api<QuotesResponse>("/api/stocks/quotes"),
  });
  const portfolio = useQuery({
    queryKey: ["stocks", "portfolio"],
    queryFn: () => api<PortfolioResponse>("/api/stocks/portfolio"),
    staleTime: 0,
  });
  const trades = useQuery({
    queryKey: ["stocks", "trades"],
    queryFn: () => api<TradesResponse>("/api/stocks/trades"),
    staleTime: 0,
    enabled: tab === "history",
  });

  const trade = useMutation({
    mutationFn: (body: { symbol: string; side: "buy" | "sell"; qty: number }) =>
      api("/api/stocks/trade", { method: "POST", body }),
    onSuccess: (_d, v) => {
      useToast.getState().show(t(v.side === "buy" ? "stocks.bought" : "stocks.sold", { qty: v.qty, symbol: v.symbol }), "success");
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
    onError: (err) => {
      if (err instanceof ApiError && ["NOT_ENOUGH_CASH", "NOT_ENOUGH_SHARES", "NO_PRICE"].includes(err.code)) {
        setError(t(`stocks.errors.${err.code}`));
      } else {
        setError(errorMessage(err, t));
      }
    },
  });

  function open(s: Selected) {
    setSelected(s);
    setQty("1");
    setError("");
  }

  function confirm() {
    if (!selected) return;
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1 || n > 10000) {
      setError(t("stocks.invalidQty"));
      return;
    }
    setError("");
    trade.mutate({ symbol: selected.symbol, side: selected.side, qty: n });
  }

  const timeFormat = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" });
  const sourceBadge = (s: Source) => (
    <Badge tone={s === "delayed" ? "neutral" : "accent"}>{t(s === "delayed" ? "stocks.delayed" : "stocks.simulated")}</Badge>
  );

  const failed = (q: { isError: boolean }) => q.isError;
  const retry = (
    <Card>
      <EmptyState
        icon={WifiOff}
        title={t("common.errorTitle")}
        description={t("common.errorBody")}
        action={
          <Button
            onClick={() => {
              void quotes.refetch();
              void portfolio.refetch();
            }}
          >
            {t("common.retry")}
          </Button>
        }
      />
    </Card>
  );

  const p = portfolio.data;
  const estimate = selected ? selected.price * (Number.isFinite(Number(qty)) ? Number(qty) : 0) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("stocks.title")}</h1>
        <p className="text-muted">{t("stocks.subtitle")}</p>
      </div>

      {p ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: t("stocks.cash"), value: inr(p.cash, lang), tone: "text-ink" },
            { label: t("stocks.holdingsValue"), value: inr(p.holdingsValue, lang), tone: "text-ink" },
            { label: t("stocks.netWorth"), value: inr(p.netWorth, lang), tone: "text-ink" },
            { label: t("stocks.totalPnl"), value: signed(p.totalPnl, lang), tone: pnlClass(p.totalPnl) },
          ].map((s) => (
            <Card key={s.label} className="space-y-1 p-4 sm:p-4">
              <p className="text-xs text-muted">{s.label}</p>
              <p className={`text-base font-semibold sm:text-lg ${s.tone}`}>{s.value}</p>
            </Card>
          ))}
        </div>
      ) : portfolio.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      <Tabs
        label={t("stocks.title")}
        value={tab}
        onChange={setTab}
        items={[
          { id: "market", label: t("stocks.market") },
          { id: "portfolio", label: t("stocks.portfolio") },
          { id: "history", label: t("stocks.history") },
        ]}
      />

      {tab === "market" ? (
        quotes.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : failed(quotes) || !quotes.data ? (
          retry
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              {t("stocks.asOf", { time: timeFormat.format(new Date(quotes.data.asOf)) })}
            </p>
            {quotes.data.quotes.map((q) => (
              <Card key={q.symbol} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{q.symbol}</p>
                  <p className="truncate text-sm text-muted">{q.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-1 text-right">
                    <p className="font-semibold">{inr(q.price, lang)}</p>
                    {sourceBadge(q.source)}
                  </div>
                  <Button size="sm" onClick={() => open({ symbol: q.symbol, name: q.name, price: q.price, side: "buy" })}>
                    {t("stocks.buy")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === "portfolio" ? (
        portfolio.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : failed(portfolio) || !p ? (
          retry
        ) : p.holdings.length === 0 ? (
          <Card>
            <EmptyState icon={LineChart} title={t("stocks.emptyPortfolio")} />
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="space-y-1 p-4 sm:p-4">
                <p className="text-xs text-muted">{t("stocks.unrealized")}</p>
                <p className={`font-semibold ${pnlClass(p.unrealizedPnl)}`}>{signed(p.unrealizedPnl, lang)}</p>
              </Card>
              <Card className="space-y-1 p-4 sm:p-4">
                <p className="text-xs text-muted">{t("stocks.realized")}</p>
                <p className={`font-semibold ${pnlClass(p.realizedPnl)}`}>{signed(p.realizedPnl, lang)}</p>
              </Card>
            </div>

            <Card className="space-y-3">
              <h2 className="font-semibold">{t("stocks.chartTitle")}</h2>
              <PnlChart data={p.holdings.map((h) => ({ symbol: h.symbol, pnl: h.pnl }))} />
            </Card>

            {p.holdings.map((h) => (
              <Card key={h.symbol} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{h.symbol}</p>
                    <p className="text-sm text-muted">{h.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${pnlClass(h.pnl)}`}>{signed(h.pnl, lang)}</p>
                    <p className={`text-xs ${pnlClass(h.pnl)}`}>{h.pnlPercent.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted">{t("stocks.qty")}</p>
                    <p>{h.qty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("stocks.avg")}</p>
                    <p>{inr(h.avgPrice, lang)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("stocks.price")}</p>
                    <p>{inr(h.price, lang)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("stocks.value")}</p>
                    <p>{inr(h.value, lang)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => open({ symbol: h.symbol, name: h.name, price: h.price, side: "buy" })}>
                    {t("stocks.buy")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => open({ symbol: h.symbol, name: h.name, price: h.price, side: "sell" })}
                  >
                    {t("stocks.sell")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === "history" ? (
        trades.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : trades.isError || !trades.data ? (
          <Card>
            <EmptyState
              icon={WifiOff}
              title={t("common.errorTitle")}
              action={<Button onClick={() => void trades.refetch()}>{t("common.retry")}</Button>}
            />
          </Card>
        ) : trades.data.trades.length === 0 ? (
          <Card>
            <EmptyState icon={LineChart} title={t("stocks.emptyHistory")} />
          </Card>
        ) : (
          <div className="space-y-3">
            {trades.data.trades.map((tr) => (
              <Card key={tr.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {t(`stocks.side.${tr.side}`)} {tr.qty} {tr.symbol}
                  </p>
                  <p className="text-sm text-muted">{timeFormat.format(new Date(tr.createdAt))}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-semibold">{inr(tr.total, lang)}</p>
                  <p className="text-xs text-muted">@ {inr(tr.price, lang)}</p>
                  {tr.side === "sell" ? (
                    <p className={`text-xs ${pnlClass(tr.realized)}`}>{signed(tr.realized, lang)}</p>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}

      <p className="text-xs text-muted">{t("stocks.disclaimer")}</p>

      <Modal
        open={selected !== null}
        title={selected ? `${t(`stocks.side.${selected.side}`)} ${selected.symbol}` : ""}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {selected.name} - {t("stocks.price")}: {inr(selected.price, lang)}
            </p>
            <Input
              label={t("stocks.qty")}
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <p className="text-sm font-medium">{t("stocks.estimated", { total: inr(estimate, lang) })}</p>
            {error ? (
              <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
                {error}
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                {t("common.cancel")}
              </Button>
              <Button loading={trade.isPending} onClick={confirm}>
                {t(selected.side === "buy" ? "stocks.confirmBuy" : "stocks.confirmSell")}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}