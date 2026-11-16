import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { rd } from "../../tools/calc";
import { inr, positive } from "../../tools/format";
import { CalcLayout, ResultRow } from "./CalcLayout";

export function RdCalc() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("6.5");
  const [months, setMonths] = useState("24");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof rd> | null>(() => rd(5000, 6.5, 24));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const m = positive(monthly);
    const r = positive(rate);
    const n = positive(months);
    if (m === null || r === null || n === null || n > 240 || r > 100) {
      setError(t("tools.invalid"));
      return;
    }
    setError("");
    setResult(rd(m, r, Math.round(n)));
  }

  return (
    <CalcLayout title={t("tools.rd.name")} description={t("tools.rd.desc")}>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label={t("tools.rd.monthly")} inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          <Input label={t("tools.ratePercent")} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Input label={t("tools.months")} inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
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
            <ResultRow label={t("tools.invested")} value={inr(result.invested, lang)} />
            <ResultRow label={t("tools.estimatedGain")} value={inr(result.gain, lang)} />
            <ResultRow label={t("tools.estimatedValue")} value={inr(result.value, lang)} strong />
          </Card>
          <p className="text-sm text-muted">{t("tools.rd.note")}</p>
        </>
      ) : null}
    </CalcLayout>
  );
}