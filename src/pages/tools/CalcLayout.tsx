    import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

type Props = { title: string; description: string; children: ReactNode };

// The common frame for every calculator.
export function CalcLayout({ title, description, children }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Link to="/tools" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        {t("tools.back")}
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted">{description}</p>
      </div>
      {children}
      <p className="text-xs text-muted">{t("tools.disclaimer")}</p>
    </div>
  );
}

export function ResultRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className={strong ? "text-lg font-semibold text-accent" : "font-medium"}>{value}</span>
    </div>
  );
}