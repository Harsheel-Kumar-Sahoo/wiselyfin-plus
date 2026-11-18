import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { inr } from "../tools/format";

// Soft, theme-friendly shades built from the accent color. No extra colors are introduced.
const SHADES = [1, 0.8, 0.62, 0.48, 0.36, 0.26, 0.18, 0.12];

export function SpendChart({ data }: { data: Array<{ category: string; amount: number }> }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-4">
      <div className="h-56 w-full" role="img" aria-label={t("budget.byCategory")}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={55}
              outerRadius={90}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.category}
                  fill={`color-mix(in srgb, var(--accent) ${Math.round((SHADES[i % SHADES.length] ?? 0.1) * 100)}%, var(--surface))`}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [inr(Number(v), lang), t(`budget.cat.${String(name)}`)]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-sm">
        {data.map((d, i) => (
          <li key={d.category} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full"
                style={{
                  background: `color-mix(in srgb, var(--accent) ${Math.round((SHADES[i % SHADES.length] ?? 0.1) * 100)}%, var(--surface))`,
                }}
              />
              {t(`budget.cat.${d.category}`)}
            </span>
            <span className="text-muted">
              {inr(d.amount, lang)} ({total > 0 ? Math.round((d.amount / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}