import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Temporary screen. It is replaced in the next sub-steps.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="p-8 text-lg">The WiselyFin Plus frontend is running.</div>
  </StrictMode>
);