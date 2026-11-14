import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../../components/Card";
import { LanguageSelect } from "../../components/LanguageSelect";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

// The common frame for login, signup and reset screens.
export function AuthLayout({ title, subtitle, children }: Props) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-bg px-4 py-6 text-ink">
      <div className="mx-auto flex max-w-md justify-end">
        <LanguageSelect />
      </div>
      <div className="mx-auto mt-6 max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold text-accent">{t("app.name")}</p>
          <p className="text-sm text-muted">{t("app.tagline")}</p>
        </div>
        <Card className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}