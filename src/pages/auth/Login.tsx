import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { errorMessage } from "../../lib/errorMessage";
import { AuthLayout } from "./AuthLayout";

export function Login() {
  const { t } = useTranslation();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      // On success the app moves to Home by itself.
    } catch (err) {
      setError(errorMessage(err, t));
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? (
          <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
            {error}
          </div>
        ) : null}
        <Input
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t("auth.password")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-accent hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          {t("auth.login")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <Link to="/signup" className="font-medium text-accent hover:underline">
          {t("auth.signup")}
        </Link>
      </p>
    </AuthLayout>
  );
}