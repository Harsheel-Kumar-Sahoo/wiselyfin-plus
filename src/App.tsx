import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";
import { AppShell } from "./components/AppShell";
import { ToastViewport } from "./components/Toast";
import { queryClient } from "./lib/queryClient";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { Login } from "./pages/auth/Login";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { Signup } from "./pages/auth/Signup";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { ComingSoon, Home, NotFound } from "./pages/Basic";
import { LessonPage } from "./pages/learn/LessonPage";
import { Learn } from "./pages/learn/Learn";
import { PathPage } from "./pages/learn/PathPage";
import { Wallet } from "./pages/wallet/Wallet";

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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/lesson/:slug" element={<LessonPage />} />
              <Route path="learn/:slug" element={<PathPage />} />
              <Route path="tools" element={<ComingSoon titleKey="nav.tools" />} />
              <Route path="wallet" element={<Wallet />} />
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