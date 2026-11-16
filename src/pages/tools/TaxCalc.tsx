import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { incomeTax } from "../../tools/calc";
import { inr, positive } from "../../tools/format";
import { NEW_REGIME, OLD_REGIME, TAX_YEAR_LABEL } from "../../tools/taxConfig";
import { CalcLayout, ResultRow } from "./CalcLayout";

type Result = { income: number; newTax: ReturnType<typeof incomeTax>; oldTax: ReturnType<typeof incomeTax> };

function compute(income: number, deductions: number): Result {
  return {
    income,
    newTax: incomeTax(income, 0, NEW_REGIME),
    oldTax: incomeTax(income, deductions, OLD_REGIME),
  };
}

export function TaxCalc() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [income, setIncome] = useState("1000000");
  const [deductions, setDeductions] = useState("150000");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(() => compute(1000000, 150000));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const i = positive(income);
    const d = deductions.trim() === "" ? 0 : Number(deductions.replace(/,/g, ""));
    if (i === null || !Number.isFinite(d) || d < 0) {
      setError(t("tools.invalid"));
      return;
    }
    setError("");
    setResult(compute(i, d));
  }

  const regimes = result
    ? [
        { key: "new", label: t("tools.tax.newRegime"), r: result.newTax },
        { key: "old", label: t("tools.tax.oldRegime"), r: result.oldTax },
      ]
    : [];

  let verdict = "";
  if (result) {
    const diff = Math.round(result.newTax.total) - Math.round(result.oldTax.total);
    verdict =
      diff === 0
        ? t("tools.tax.same")
        : t("tools.tax.better", { regime: diff < 0 ? t("tools.tax.newRegime") : t("tools.tax.oldRegime") });
  }

  return (
    <CalcLayout title={t("tools.tax.name")} description={t("tools.tax.desc")}>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input label={t("tools.tax.income")} inputMode="decimal" value={income} onChange={(e) => setIncome(e.target.value)} />
          <Input label={t("tools.tax.deductions")} inputMode="decimal" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
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
          <div className="grid gap-4 sm:grid-cols-2">
            {regimes.map(({ key, label, r }) => (
              <Card key={key} className="divide-y divide-line">
                <h2 className="pb-2 font-semibold">{label}</h2>
                <ResultRow label={t("tools.tax.taxable")} value={inr(r.taxable, lang)} />
                <ResultRow label={t("tools.tax.slabTax")} value={inr(r.tax, lang)} />
                <ResultRow label={t("tools.tax.rebate")} value={inr(r.rebate, lang)} />
                <ResultRow label={t("tools.tax.cess")} value={inr(r.cess, lang)} />
                <ResultRow label={t("tools.tax.total")} value={inr(r.total, lang)} strong />
              </Card>
            ))}
          </div>
          <Card className="text-center font-medium text-accent">{verdict}</Card>
          <p className="text-sm text-muted">{t("tools.tax.yearLabel", { year: TAX_YEAR_LABEL })}</p>
          <p className="text-sm text-muted">{t("tools.tax.note")}</p>
        </>
      ) : null}
    </CalcLayout>
  );
}