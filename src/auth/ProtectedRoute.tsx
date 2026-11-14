import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { useAuth } from "./useAuth";

function FullScreenLoading() {
  return (
    <div className="mx-auto max-w-md space-y-3 p-8">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// Only logged-in visitors may pass. Everyone else is sent to the login screen.
export function ProtectedRoute() {
  const { t } = useTranslation();
  const status = useAuth((s) => s.status);
  const load = useAuth((s) => s.load);
  const location = useLocation();

  if (status === "loading") return <FullScreenLoading />;

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
  if (status === "loading") return <FullScreenLoading />;
  if (status === "authed") return <Navigate to="/" replace />;
  return <Outlet />;
}