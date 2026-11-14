import { useTranslation } from "react-i18next";

// Shown full screen while the app checks if you are logged in.
export function Splash() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-bg px-4 text-center">
      <p className="text-3xl font-semibold text-accent">{t("app.name")}</p>
      <p className="text-sm text-muted">{t("app.tagline")}</p>
    </div>
  );
}