// Tries to cheat the live quiz and coin rules. Usage: npm run learntest -- https://your-site.vercel.app
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base.startsWith("http")) {
  console.error("Usage: npm run learntest -- https://your-site.vercel.app");
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

async function call(method: string, path: string, body?: unknown, useCookies = true) {
  const cookie = Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(useCookies && cookie ? { Cookie: cookie } : {}),
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
  const email = `learn-${Date.now()}@example.com`;
  let r;

  r = await call("GET", "/api/learn/paths", undefined, false);
  check("paths without login are refused", r.status === 401, `got ${r.status}`);

  r = await call("POST", "/api/auth/signup", { name: "Learn Test", email, password: "Test1234pass" });
  check("signup works", r.status === 201, `got ${r.status}`);

  r = await call("GET", "/api/learn/paths");
  check("three learning paths are listed", r.status === 200 && r.json?.paths?.length === 3, `got ${r.status}`);

  r = await call("GET", "/api/learn/lessons/budgeting-basics");
  check("lesson opens with 3 questions", r.status === 200 && r.json?.lesson?.questions?.length === 3, `got ${r.status}`);
  check(
    "correct answers are NOT sent to the browser",
    r.status === 200 && !JSON.stringify(r.json).includes("correctIndex")
  );

  r = await call("POST", "/api/learn/lessons/budgeting-basics/submit", { answers: [1] });
  check("missing answers are rejected", r.status === 400, `got ${r.status}`);

  r = await call("POST", "/api/learn/lessons/budgeting-basics/submit", {
    answers: [0, 0, 1],
    score: 100,
    passed: true,
    coins: 9999,
  });
  check(
    "wrong answers fail, even with a faked score and coins",
    r.status === 200 && r.json?.result?.passed === false && r.json?.reward?.coins === 0,
    `got ${r.status}`
  );

  r = await call("GET", "/api/wallet");
  check("balance is still 0 after cheating", r.status === 200 && r.json?.balance === 0, `balance ${r.json?.balance}`);

  r = await call("POST", "/api/learn/lessons/budgeting-basics/submit", { answers: [1, 2, 0] });
  check(
    "correct answers pass and pay 10 coins",
    r.status === 200 && r.json?.result?.passed === true && r.json?.reward?.coins === 10,
    `got ${r.status}`
  );

  r = await call("POST", "/api/learn/lessons/budgeting-basics/submit", { answers: [1, 2, 0] });
  check(
    "passing again pays nothing more",
    r.status === 200 && r.json?.result?.passed === true && r.json?.reward?.coins === 0,
    `coins ${r.json?.reward?.coins}`
  );

  r = await call("GET", "/api/wallet");
  check(
    "wallet shows 10 coins and one ledger row",
    r.status === 200 && r.json?.balance === 10 && r.json?.entries?.length === 1,
    `balance ${r.json?.balance}, rows ${r.json?.entries?.length}`
  );

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test could not run:", err instanceof Error ? err.message : err);
  process.exit(1);
});