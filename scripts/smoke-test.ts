// Checks the live account routes end to end. Usage: npm run smoke -- https://your-site.vercel.app
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base.startsWith("http")) {
  console.error("Usage: npm run smoke -- https://your-site.vercel.app");
  process.exit(1);
}

const jar: Record<string, string> = {};

function saveCookies(res: Response) {
  for (const line of res.headers.getSetCookie()) {
    const pair = line.split(";")[0] ?? "";
    const i = pair.indexOf("=");
    if (i < 1) continue;
    const name = pair.slice(0, i).trim();
    const value = pair.slice(i + 1).trim();
    if (value === "") delete jar[name];
    else jar[name] = value;
  }
}

async function call(method: string, path: string, body?: unknown) {
  const cookie = Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  saveCookies(res);
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + detail}`);
  if (!ok) failed += 1;
}

async function main() {
  const email = `smoke-${Date.now()}@example.com`;
  const password = "Test1234pass";
  let r;

  r = await call("GET", "/api/health");
  check("health check answers 200", r.status === 200, `got ${r.status}`);

  r = await call("GET", "/api/auth/me");
  check("me without login is refused", r.status === 401, `got ${r.status}`);

  r = await call("POST", "/api/auth/signup", { name: "Smoke Test", email, password: "short" });
  check("weak password is rejected", r.status === 400, `got ${r.status}`);

  r = await call("POST", "/api/auth/signup", { name: "Smoke Test", email, password });
  check("signup works", r.status === 201, `got ${r.status}`);

  r = await call("POST", "/api/auth/signup", { name: "Smoke Test", email, password });
  check("duplicate signup is refused", r.status === 409, `got ${r.status}`);

  r = await call("GET", "/api/auth/me");
  check("me after signup shows the user", r.status === 200 && r.json?.user?.email === email, `got ${r.status}`);

  r = await call("POST", "/api/auth/refresh");
  check("refresh works", r.status === 200, `got ${r.status}`);

  r = await call("POST", "/api/auth/logout");
  check("logout works", r.status === 200, `got ${r.status}`);

  r = await call("GET", "/api/auth/me");
  check("me after logout is refused", r.status === 401, `got ${r.status}`);

  r = await call("POST", "/api/auth/login", { email, password: "Wrong1234pass" });
  check("wrong password is refused", r.status === 401, `got ${r.status}`);

  r = await call("POST", "/api/auth/login", { email, password });
  check("correct login works", r.status === 200, `got ${r.status}`);

  r = await call("POST", "/api/auth/forgot-password", { email: `nobody-${Date.now()}@example.com` });
  check("forgot password never reveals unknown emails", r.status === 200, `got ${r.status}`);

  r = await call("GET", "/api/cron/keepalive");
  check("keep-alive without the secret is refused", r.status === 401, `got ${r.status}`);

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test could not run:", err instanceof Error ? err.message : err);
  process.exit(1);
});