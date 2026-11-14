import "./fonts";
import { Inbox, Moon, Sun } from "lucide-react";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { Card } from "./components/Card";
import { EmptyState } from "./components/EmptyState";
import { Input } from "./components/Input";
import { LanguageSelect } from "./components/LanguageSelect";
import { Modal } from "./components/Modal";
import { ProgressBar } from "./components/ProgressBar";
import { Select } from "./components/Select";
import { Skeleton } from "./components/Skeleton";
import { Tabs } from "./components/Tabs";
import { ToastViewport, useToast } from "./components/Toast";
import "./i18n";
import { LANGUAGES } from "./i18n/languages";
import "./index.css";
import { applyTheme } from "./theme/theme";
import { useTheme } from "./theme/useTheme";

applyTheme(useTheme.getState().theme);

// Temporary screen to check all components. Replaced in the next sub-step.
function Preview() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState("home");
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg p-4 text-ink sm:p-8">
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="space-y-4">
          <h1 className="text-2xl font-semibold">{t("app.name")}</h1>
          <p className="text-muted">{t("app.tagline")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="coin">1,250 {t("coins.finCoins")}</Badge>
            <Badge tone="accent">{t("nav.learn")}</Badge>
            <Badge tone="success">{t("common.save")}</Badge>
            <Badge tone="error">{t("common.errorTitle")}</Badge>
          </div>
          <ProgressBar value={60} label={t("common.loading")} />
          <LanguageSelect />
        </Card>

        <Card className="space-y-4">
          <Tabs
            label={t("nav.home")}
            value={tab}
            onChange={setTab}
            items={[
              { id: "home", label: t("nav.home") },
              { id: "learn", label: t("nav.learn") },
              { id: "tools", label: t("nav.tools") },
            ]}
          />
          <Input label={t("auth.email")} type="email" hint={t("auth.email")} />
          <Input label={t("auth.password")} type="password" error={t("common.errorTitle")} />
          <Select
            label={t("common.language")}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
            defaultValue="en"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => useToast.getState().show(t("common.save"), "success")}>{t("common.save")}</Button>
            <Button variant="secondary" onClick={() => setOpen(true)}>
              {t("common.theme")}
            </Button>
            <Button variant="ghost" onClick={toggle}>
              {theme === "light" ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
              {t("common.switchTheme")}
            </Button>
            <Button variant="danger" onClick={() => useToast.getState().show(t("common.errorTitle"), "error")}>
              {t("common.cancel")}
            </Button>
            <Button loading>{t("common.loading")}</Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>

        <Card>
          <EmptyState
            icon={Inbox}
            title={t("common.emptyTitle")}
            description={t("common.errorBody")}
            action={<Button variant="secondary">{t("common.retry")}</Button>}
          />
        </Card>
      </div>

      <Modal open={open} title={t("common.theme")} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{t("common.errorBody")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                toggle();
                setOpen(false);
              }}
            >
              {t("common.switchTheme")}
            </Button>
          </div>
        </div>
      </Modal>

      <ToastViewport />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);