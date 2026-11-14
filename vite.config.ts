import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// For local work, API calls are forwarded to your live site (set API_PROXY_TARGET in .env).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: target
        ? { "/api": { target, changeOrigin: true, cookieDomainRewrite: "localhost" } }
        : undefined,
    },
  };
});