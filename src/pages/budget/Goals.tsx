import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Trash2, WifiOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/Input";
import { ProgressBar } from "../../components/ProgressBar";
import { Skeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";
import { errorMessage } from "../../lib/errorMessage";
import { inr, positive } from "../../tools/format";

type GoalsResponse = {
  ok: true;
  goals: Array<{ id: string; name: string; target: number; saved: number; targetDay: string }>;
};

export function Goals() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDay, setTargetDay] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ["budget", "goals"],
    queryFn: () => api<GoalsResponse>("/api/budget/goals"),
    staleTime: 0,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["budget", "goals"] });

  const create = useMutation({
    mutationFn: (body: object) => api("/api/budget/goals", { method: "POST", body }),
    onSuccess: () => {
      setName("");
      setTarget("");
      setTargetDay("");
      useToast.getState().show(t("budget.goals.created"), "success");
      void refresh();
    },
    onError: (err) => setError(errorMessage(err, t)),
  });

  const addMoney = useMutation({
    mutationFn: (v: { id: string; amount: number }) =>
      api(`/api/budget/goals/${v.id}/add`, { method: "POST", body: { amount: v.amount } }),
    onSuccess: (_d, v) => {
      setAdding((prev) => ({ ...prev, [v.id]: "" }));
      useToast.getState().show(t("budget.goals.added"), "success");
      void refresh();
    },
    onError: (err) => useToast.getState().show(errorMessage(err, t), "error"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/budget/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      useToast.getState().show(t("budget.goals.removed"), "info");
      void refresh();
    },
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    const value = positive(target);
    if (!name.trim() || value === null) {
      setError(t("budget.invalid"));
      return;
    }
    setError("");
    create.mutate({ name: name.trim(), target: value, targetDay });
  }

  return (
    <section className="space-y-4" aria-label={t("budget.goals.title")}>
      <h2 className="text-lg font-semibold">{t("budget.goals.title")}</h2>

      <Card>
        <form onSubmit={onCreate} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t("budget.goals.name")} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            <Input label={t("budget.goals.target")} inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <Input label={t("budget.goals.targetDay")} type="date" value={targetDay} onChange={(e) => setTargetDay(e.target.value)} />
          {error ? (
            <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
              {error}
            </div>
          ) : null}
          <Button type="submit" loading={create.isPending}>
            {t("budget.goals.create")}
          </Button>
        </form>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : query.isError || !query.data ? (
        <Card>
          <EmptyState
            icon={WifiOff}
            title={t("common.errorTitle")}
            action={<Button onClick={() => void query.refetch()}>{t("common.retry")}</Button>}
          />
        </Card>
      ) : query.data.goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title={t("budget.goals.empty")} />
        </Card>
      ) : (
        <div className="space-y-3">
          {query.data.goals.map((g) => {
            const percent = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            const done = g.saved >= g.target;
            return (
              <Card key={g.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{g.name}</p>
                    <p className="text-sm text-muted">
                      {t("budget.goals.saved", { saved: inr(g.saved, lang), target: inr(g.target, lang) })}
                      {g.targetDay ? ` - ${t("budget.goals.by", { date: g.targetDay })}` : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={t("budget.goals.remove")} onClick={() => remove.mutate(g.id)}>
                    <Trash2 size={18} strokeWidth={1.75} />
                  </Button>
                </div>
                <ProgressBar value={percent} label={g.name} tone="accent" />
                {done ? (
                  <p className="text-sm font-medium text-success">{t("budget.goals.done")}</p>
                ) : (
                  <form
                    className="flex items-end gap-2"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      const v = positive(adding[g.id] ?? "");
                      if (v === null) return;
                      addMoney.mutate({ id: g.id, amount: v });
                    }}
                  >
                    <div className="flex-1">
                      <Input
                        label={t("budget.goals.addAmount")}
                        inputMode="decimal"
                        value={adding[g.id] ?? ""}
                        onChange={(e) => setAdding((prev) => ({ ...prev, [g.id]: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" variant="secondary">
                      {t("budget.goals.addMoney")}
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted">{t("budget.goals.note")}</p>
    </section>
  );
}