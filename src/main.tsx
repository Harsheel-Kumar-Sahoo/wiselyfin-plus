import "@fontsource-variable/inter";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "@fontsource/noto-sans-tamil/400.css";
import "@fontsource/noto-sans-tamil/600.css";
import "@fontsource/noto-sans-telugu/400.css";
import "@fontsource/noto-sans-telugu/600.css";
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-sans-bengali/600.css";
import { Moon, Sun } from "lucide-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "./components/LanguageSelect";
import "./i18n";
import "./index.css";
import { applyTheme } from "./theme/theme";
import { useTheme } from "./theme/useTheme";

applyTheme(useTheme.getState().theme);

// Temporary screen to check languages and theme. Replaced in later steps.
function Preview() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-bg p-8 text-ink">
      <div className="mx-auto max-w-md space-y-4 rounded-card border border-line bg-surface p-6 shadow-card">
        <h1 className="text-2xl font-semibold">{t("app.name")}</h1>
        <p className="text-muted">{t("app.tagline")}</p>
        <p className="text-coin">1,250 {t("coins.finCoins")}</p>
        <LanguageSelect />
        <div>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover"
          >
            {theme === "light" ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
            {t("common.switchTheme")}
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);