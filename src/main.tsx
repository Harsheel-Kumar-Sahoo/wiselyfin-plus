import "./fonts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./i18n";
import "./index.css";
import { applyTheme } from "./theme/theme";
import { useTheme } from "./theme/useTheme";

applyTheme(useTheme.getState().theme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);