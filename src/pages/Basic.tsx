import { Clock, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";

export function Home() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  return (
    <Card className="space-y-2">
      <h1 className="text-2xl font-semibold">{t("home.welcomeTitle", { name: user?.name ?? "" })}</h1>
      <p className="text-muted">{t("home.welcomeBody")}</p>
    </Card>
  );
}

// Placeholder for screens we build in later phases.
export function ComingSoon({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t(titleKey)}</h1>
      <Card>
        <EmptyState icon={Clock} title={t("common.emptyTitle")} />
      </Card>
    </div>
  );
}

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-md p-8">
      <EmptyState
        icon={SearchX}
        title={t("common.pageNotFoundTitle")}
        description={t("common.pageNotFoundBody")}
        action={
          <Link to="/">
            <Button>{t("common.goHome")}</Button>
          </Link>
        }
      />
    </div>
  );
}