import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { inr } from "../tools/format";

// One bar per share: green above zero for profit, red below zero for loss.
export function PnlChart({ data }: { data: Array<{ symbol: string; pnl: number }> }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="h-64 w-full" role="img" aria-label={t("stocks.chartTitle")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="symbol" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            width={56}
            tickFormatter={(v) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(Number(v))}
          />
          <Tooltip
            formatter={(v) => [inr(Number(v), lang), t("stocks.pnl")]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
            }}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.symbol} fill={d.pnl >= 0 ? "var(--success)" : "var(--error)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}