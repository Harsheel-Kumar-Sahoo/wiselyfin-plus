import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { YearPoint } from "../tools/calc";
import { inr } from "../tools/format";

// Two areas: money you put in, and what it grows to. Colors come from the theme tokens.
export function GrowthChart({ points }: { points: YearPoint[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="h-64 w-full" role="img" aria-label={t("tools.chartTitle")}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            width={56}
            tickFormatter={(v) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(Number(v))}
          />
          <Tooltip
            formatter={(v, name) => [inr(Number(v), lang), String(name ?? "")]}
            labelFormatter={(y) => t("tools.yearLabel", { year: String(y ?? "") })}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
            }}
          />
          <Area
            type="monotone"
            dataKey="invested"
            name={t("tools.invested")}
            stroke="var(--text-muted)"
            fill="var(--bg-soft)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={t("tools.estimatedValue")}
            stroke="var(--accent)"
            fill="var(--accent-soft)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}