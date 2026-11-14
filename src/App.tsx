import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";
import { AppShell } from "./components/AppShell";
import { Card } from "./components/Card";
import { ToastViewport } from "./components/Toast";
import { queryClient } from "./lib/queryClient";
import { ComingSoon, Home, NotFound } from "./pages/Basic";

// Temporary login screen. The real one arrives in the next step.
function LoginPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-md p-8">
      <Card className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("auth.loginTitle")}</h1>
        <p className="text-muted">{t("auth.loginSubtitle")}</p>
      </Card>
    </div>
  );
}

export function App() {
  const load = useAuth((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPlaceholder />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="learn" element={<ComingSoon titleKey="nav.learn" />} />
              <Route path="tools" element={<ComingSoon titleKey="nav.tools" />} />
              <Route path="wallet" element={<ComingSoon titleKey="nav.wallet" />} />
              <Route path="profile" element={<ComingSoon titleKey="nav.profile" />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastViewport />
    </QueryClientProvider>
  );
}