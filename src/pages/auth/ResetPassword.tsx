import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { api } from "../../lib/api";
import { errorMessage, fieldError } from "../../lib/errorMessage";
import { AuthLayout } from "./AuthLayout";

export function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState<unknown>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFailure(null);
    setLoading(true);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: { token, password } });
      setDone(true);
    } catch (err) {
      setFailure(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t("auth.resetTitle")}>
      {!token ? (
        <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
          {t("auth.missingToken")}
        </div>
      ) : done ? (
        <div role="status" className="rounded-control bg-success-soft px-3 py-2 text-sm text-success">
          {t("auth.resetSuccess")}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {failure ? (
            <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
              {errorMessage(failure, t)}
            </div>
          ) : null}
          <Input
            label={t("auth.newPassword")}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldError(failure, "password", t)}
            hint={t("auth.passwordHint")}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            {t("auth.resetPassword")}
          </Button>
        </form>
      )}
      <p className="text-center text-sm">
        <Link to="/login" className="font-medium text-accent hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </AuthLayout>
  );
}