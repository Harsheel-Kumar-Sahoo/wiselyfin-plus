import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { LANGUAGES, isLanguageCode } from "../i18n/languages";

export function LanguageSelect() {
  const { t, i18n } = useTranslation();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted">
      <Globe size={18} strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={i18n.language}
        onChange={(e) => {
          const value = e.target.value;
          if (isLanguageCode(value)) changeLanguage(value);
        }}
        className="rounded-control border border-line bg-surface px-3 py-2 text-ink"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}