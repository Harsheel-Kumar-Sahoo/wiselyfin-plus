import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { api } from "../../lib/api";
import { AuthLayout } from "./AuthLayout";

type State = "checking" | "success" | "failed" | "missing";

export function VerifyEmail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>(token ? "checking" : "missing");
  const started = useRef(false);

  useEffect(() => {
    // The link works only once, so make sure we send it only once.
    if (!token || started.current) return;
    started.current = true;
    api("/api/auth/verify-email", { method: "POST", body: { token } })
      .then(() => {
        setState("success");
        void useAuth.getState().load();
      })
      .catch(() => setState("failed"));
  }, [token]);

  return (
    <AuthLayout title={t("auth.verifyTitle")}>
      {state === "checking" ? <p className="text-sm text-muted">{t("auth.verifyChecking")}</p> : null}
      {state === "success" ? (
        <div role="status" className="rounded-control bg-success-soft px-3 py-2 text-sm text-success">
          {t("auth.verifySuccess")}
        </div>
      ) : null}
      {state === "failed" ? (
        <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
          {t("auth.verifyFailed")}
        </div>
      ) : null}
      {state === "missing" ? (
        <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
          {t("auth.missingToken")}
        </div>
      ) : null}
      <p className="text-center text-sm">
        <Link to="/" className="font-medium text-accent hover:underline">
          {t("common.goHome")}
        </Link>
      </p>
    </AuthLayout>
  );
}