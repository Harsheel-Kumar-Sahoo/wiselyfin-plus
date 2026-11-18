import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, WifiOff, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Skeleton } from "../../components/Skeleton";
import { SpendChart } from "../../components/SpendChart";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";
import { errorMessage } from "../../lib/errorMessage";
import { inr, positive } from "../../tools/format";
import { Goals } from "./Goals";

const CATEGORIES = [
  "food",
  "transport",
  "rent",
  "bills",
  "shopping",
  "health",
  "education",
  "entertainment",
  "savings",
  "salary",
  "other",
];

type EntriesResponse = {
  ok: true;
  totals: { income: number; spent: number; balance: number };
  byCategory: Array<{ category: string; amount: number }>;
  entries: Array<{ id: string; type: "expense" | "income"; amount: number; category: string; note: string; day: string }>;
};

// Today's date as text like "2026-11-18", in India time.
function todayIst(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function Budget() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const queryClient = useQueryClient();

  const [month, setMonth] = useState(todayIst().slice(0, 7));
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [day, setDay] = useState(todayIst());
  const [error, setError] = useState("");

  const query = useQuery({
    queryKey: ["budget", "entries", month],
    queryFn: () => api<EntriesResponse>(`/api/budget/entries?month=${month}`),
    staleTime: 0,
  });

  const add = useMutation({
    mutationFn: (body: object) => api("/api/budget/entries", { method: "POST", body }),
    onSuccess: () => {
      setAmount("");
      setNote("");
      useToast.getState().show(t("budget.saved"), "success");
      void queryClient.invalidateQueries({ queryKey: ["budget", "entries"] });
    },
    onError: (err) => setError(errorMessage(err, t)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/budget/entries/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      useToast.getState().show(t("budget.deleted"), "info");
      void queryClient.invalidateQueries({ queryKey: ["budget", "entries"] });
    },
    onError: (err) => useToast.getState().show(errorMessage(err, t), "error"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = positive(amount);
    if (value === null || value > 100000000 || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      setError(t("budget.invalid"));
      return;
    }
    setError("");
    add.mutate({ type, amount: value, category, note: note.trim(), day });
  }

  const data = query.data;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("budget.title")}</h1>
        <p className="text-muted">{t("budget.subtitle")}</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">{t("budget.addEntry")}</h2>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t("budget.type")}
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: "expense", label: t("budget.expense") },
                { value: "income", label: t("budget.incomeType") },
              ]}
            />
            <Input label={t("budget.amount")} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Select
              label={t("budget.category")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES.map((c) => ({ value: c, label: t(`budget.cat.${c}`) }))}
            />
            <Input label={t("budget.date")} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <Input label={t("budget.note")} maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} />
          {error ? (
            <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
              {error}
            </div>
          ) : null}
          <Button type="submit" loading={add.isPending}>
            {t("budget.save")}
          </Button>
        </form>
      </Card>

      <Input label={t("budget.month")} type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : query.isError || !data ? (
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
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("budget.income"), value: data.totals.income, tone: "text-success" },
              { label: t("budget.spent"), value: data.totals.spent, tone: "text-error" },
              { label: t("budget.balance"), value: data.totals.balance, tone: "text-ink" },
            ].map((s) => (
              <Card key={s.label} className="space-y-1 p-4 text-center sm:p-4">
                <p className="text-xs text-muted">{s.label}</p>
                <p className={`text-base font-semibold sm:text-lg ${s.tone}`}>{inr(s.value, lang)}</p>
              </Card>
            ))}
          </div>

          <Card className="space-y-3">
            <h2 className="font-semibold">{t("budget.byCategory")}</h2>
            {data.byCategory.length === 0 ? (
              <p className="text-sm text-muted">{t("budget.noSpending")}</p>
            ) : (
              <SpendChart data={data.byCategory} />
            )}
          </Card>

          <h2 className="text-lg font-semibold">{t("budget.entries")}</h2>
          {data.entries.length === 0 ? (
            <Card>
              <EmptyState icon={Wallet} title={t("budget.noEntries")} />
            </Card>
          ) : (
            <div className="space-y-3">
              {data.entries.map((e) => (
                <Card key={e.id} className="flex items-center justify-between gap-4 p-4 sm:p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{t(`budget.cat.${e.category}`)}</p>
                    <p className="truncate text-sm text-muted">
                      {e.day}
                      {e.note ? ` - ${e.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={e.type === "income" ? "font-semibold text-success" : "font-semibold text-error"}>
                      {e.type === "income" ? "+" : "-"}
                      {inr(e.amount, lang)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t("budget.delete")}
                      onClick={() => remove.mutate(e.id)}
                    >
                      <Trash2 size={18} strokeWidth={1.75} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Goals />
    </div>
  );
}