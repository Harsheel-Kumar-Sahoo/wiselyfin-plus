import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { ProgressBar } from "../../components/ProgressBar";
import { emi } from "../../tools/calc";
import { inr, positive } from "../../tools/format";
import { CalcLayout, ResultRow } from "./CalcLayout";

export function EmiCalc() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("5");
  const [error, setError] = useState("");
  const [loan, setLoan] = useState(500000);
  const [result, setResult] = useState<ReturnType<typeof emi> | null>(() => emi(500000, 10, 5));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const p = positive(principal);
    const r = positive(rate);
    const y = positive(years);
    if (p === null || r === null || y === null || y > 40 || r > 100) {
      setError(t("tools.invalid"));
      return;
    }
    setError("");
    setLoan(p);
    setResult(emi(p, r, y));
  }

  const interestShare = result && result.total > 0 ? (result.interest / result.total) * 100 : 0;

  return (
    <CalcLayout title={t("tools.emi.name")} description={t("tools.emi.desc")}>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label={t("tools.emi.principal")} inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          <Input label={t("tools.ratePercent")} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Input label={t("tools.years")} inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
          {error ? (
            <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
              {error}
            </div>
          ) : null}
          <Button type="submit">{t("tools.calculate")}</Button>
        </form>
      </Card>
      {result ? (
        <>
          <Card className="divide-y divide-line">
            <ResultRow label={t("tools.emi.payment")} value={inr(result.payment, lang)} strong />
            <ResultRow label={t("tools.emi.totalInterest")} value={inr(result.interest, lang)} />
            <ResultRow label={t("tools.emi.totalPaid")} value={inr(result.total, lang)} />
          </Card>
          <Card className="space-y-2">
            <div className="flex justify-between text-sm text-muted">
              <span>{inr(loan, lang)}</span>
              <span>{t("tools.emi.totalInterest")}: {Math.round(interestShare)}%</span>
            </div>
            <ProgressBar value={interestShare} label={t("tools.emi.totalInterest")} />
          </Card>
          <p className="text-sm text-muted">{t("tools.emi.note")}</p>
        </>
      ) : null}
    </CalcLayout>
  );
}