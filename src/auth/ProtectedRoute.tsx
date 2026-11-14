import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Splash } from "../components/Splash";
import { useAuth } from "./useAuth";

// Only logged-in visitors may pass. Everyone else is sent to the login screen.
export function ProtectedRoute() {
  const { t } = useTranslation();
  const status = useAuth((s) => s.status);
  const load = useAuth((s) => s.load);
  const location = useLocation();

  if (status === "loading") return <Splash />;

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md p-8">
        <EmptyState
          icon={WifiOff}
          title={t("common.serverDownTitle")}
          description={t("common.serverDownBody")}
          action={<Button onClick={() => void load()}>{t("common.retry")}</Button>}
        />
      </div>
    );
  }

  if (status === "guest") return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

// Login, signup and reset screens: logged-in visitors are sent to Home instead.
export function GuestRoute() {
  const status = useAuth((s) => s.status);
  if (status === "loading") return <Splash />;
  if (status === "authed") return <Navigate to="/" replace />;
  return <Outlet />;
}