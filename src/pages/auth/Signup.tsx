import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { errorMessage, fieldError } from "../../lib/errorMessage";
import { AuthLayout } from "./AuthLayout";

export function Signup() {
  const { t, i18n } = useTranslation();
  const signup = useAuth((s) => s.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFailure(null);
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password, i18n.language);
      // On success the app moves to Home by itself.
    } catch (err) {
      setFailure(err);
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t("auth.signupTitle")} subtitle={t("auth.signupSubtitle")}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {failure ? (
          <div role="alert" className="rounded-control bg-error-soft px-3 py-2 text-sm text-error">
            {errorMessage(failure, t)}
          </div>
        ) : null}
        <Input
          label={t("auth.name")}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldError(failure, "name", t)}
          required
        />
        <Input
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError(failure, "email", t)}
          required
        />
        <Input
          label={t("auth.password")}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldError(failure, "password", t)}
          hint={t("auth.passwordHint")}
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          {t("auth.signup")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="font-medium text-accent hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </AuthLayout>
  );
}