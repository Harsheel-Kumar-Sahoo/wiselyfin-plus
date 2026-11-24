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
import { NotFound } from "./pages/Basic";
import { Budget } from "./pages/budget/Budget";
import { Leaderboard } from "./pages/community/Leaderboard";
import { Profile } from "./pages/community/Profile";
import { Home } from "./pages/home/Home";
import { LessonPage } from "./pages/learn/LessonPage";
import { Learn } from "./pages/learn/Learn";
import { PathPage } from "./pages/learn/PathPage";
import { News } from "./pages/news/News";
import { Stocks } from "./pages/stocks/Stocks";
import { CompoundCalc } from "./pages/tools/CompoundCalc";
import { EmiCalc } from "./pages/tools/EmiCalc";
import { FdCalc } from "./pages/tools/FdCalc";
import { RdCalc } from "./pages/tools/RdCalc";
import { SipCalc } from "./pages/tools/SipCalc";
import { TaxCalc } from "./pages/tools/TaxCalc";
import { ToolsHome } from "./pages/tools/ToolsHome";
import { Tutor } from "./pages/tutor/Tutor";
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
              <Route path="tools" element={<ToolsHome />} />
              <Route path="tools/sip" element={<SipCalc />} />
              <Route path="tools/emi" element={<EmiCalc />} />
              <Route path="tools/compound" element={<CompoundCalc />} />
              <Route path="tools/fd" element={<FdCalc />} />
              <Route path="tools/rd" element={<RdCalc />} />
              <Route path="tools/tax" element={<TaxCalc />} />
              <Route path="budget" element={<Budget />} />
              <Route path="stocks" element={<Stocks />} />
              <Route path="tutor" element={<Tutor />} />
              <Route path="news" element={<News />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastViewport />
    </QueryClientProvider>
  );
}