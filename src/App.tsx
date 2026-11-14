import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";
import { AppShell } from "./components/AppShell";
import { ToastViewport } from "./components/Toast";
import { queryClient } from "./lib/queryClient";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { ComingSoon, Home, NotFound } from "./pages/Basic";

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