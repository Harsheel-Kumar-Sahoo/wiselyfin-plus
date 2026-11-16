import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { GrowthChart } from "../../components/GrowthChart";
import { Input } from "../../components/Input";
import { fd } from "../../tools/calc";
import { inr, positive } from "../../tools/format";
import { CalcLayout, ResultRow } from "./CalcLayout";

export function FdCalc() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof fd> | null>(() => fd(100000, 7, 5));

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
    setResult(fd(p, r, y));
  }

  return (
    <CalcLayout title={t("tools.fd.name")} description={t("tools.fd.desc")}>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label={t("tools.fd.principal")} inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
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
          <p className="text-sm text-muted">{t("tools.fd.note")}</p>
        </>
      ) : null}
    </CalcLayout>
  );
}