import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { GrowthChart } from "../../components/GrowthChart";
import { Input } from "../../components/Input";
import { sip } from "../../tools/calc";
import { inr, positive } from "../../tools/format";
import { CalcLayout, ResultRow } from "./CalcLayout";

export function SipCalc() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof sip> | null>(() => sip(5000, 12, 10));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const m = positive(monthly);
    const r = positive(rate);
    const y = positive(years);
    if (m === null || r === null || y === null || y > 60 || r > 100) {
      setError(t("tools.invalid"));
      return;
    }
    setError("");
    setResult(sip(m, r, y));
  }

  return (
    <CalcLayout title={t("tools.sip.name")} description={t("tools.sip.desc")}>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label={t("tools.sip.monthly")} inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
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
            <ResultRow label={t("tools.invested")} value={inr(result.invested, lang)} />
            <ResultRow label={t("tools.estimatedGain")} value={inr(result.gain, lang)} />
            <ResultRow label={t("tools.estimatedValue")} value={inr(result.value, lang)} strong />
          </Card>
          <Card className="space-y-3">
            <h2 className="font-semibold">{t("tools.chartTitle")}</h2>
            <GrowthChart points={result.points} />
          </Card>
          <p className="text-sm text-muted">{t("tools.sip.note")}</p>
        </>
      ) : null}
    </CalcLayout>
  );
}