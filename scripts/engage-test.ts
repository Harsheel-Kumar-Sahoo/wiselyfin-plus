// Tests streaks, badges, the daily challenge and the leaderboard on the live site.
// Usage: npm run engagetest -- https://your-site.vercel.app
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base.startsWith("http")) {
  console.error("Usage: npm run engagetest -- https://your-site.vercel.app");
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
  const email = `engage-${Date.now()}@example.com`;
  let r;

  r = await call("GET", "/api/engagement/challenge", undefined, false);
  check("challenge without login is refused", r.status === 401, `got ${r.status}`);

  r = await call("POST", "/api/auth/signup", { name: "Engage Test", email, password: "Test1234pass" });
  check("signup works", r.status === 201, `got ${r.status}`);

  r = await call("GET", "/api/engagement/challenge");
  check("today's challenge is available", r.status === 200 && r.json?.available === true, `got ${r.status}`);
  check(
    "challenge does not reveal the answer",
    r.status === 200 && !JSON.stringify(r.json).includes("correctIndex")
  );

  r = await call("POST", "/api/learn/lessons/budgeting-basics/submit", { answers: [1, 2, 0] });
  check(
    "passing a quiz starts a streak of 1 and earns a badge",
    r.status === 200 && r.json?.streak?.value === 1 && r.json?.newBadges?.includes("first_lesson"),
    `streak ${r.json?.streak?.value}, badges ${JSON.stringify(r.json?.newBadges)}`
  );

  r = await call("POST", "/api/learn/lessons/what-is-inflation/submit", { answers: [0, 2, 2] });
  check(
    "a second pass on the same day keeps the streak at 1",
    r.status === 200 && r.json?.streak?.value === 1,
    `streak ${r.json?.streak?.value}`
  );

  r = await call("POST", "/api/engagement/challenge/answer", { choice: 99 });
  check("an impossible choice is rejected", r.status === 400, `got ${r.status}`);

  // Try every option: only one is right, and only the first try counts.
  r = await call("POST", "/api/engagement/challenge/answer", { choice: 0 });
  check("the first challenge answer is accepted", r.status === 200, `got ${r.status}`);
  const firstCoins = r.json?.reward?.coins ?? -1;

  r = await call("POST", "/api/engagement/challenge/answer", { choice: 1 });
  check("a second try the same day is refused", r.status === 409, `got ${r.status}`);

  r = await call("GET", "/api/engagement/challenge");
  check("challenge now shows as attempted", r.status === 200 && r.json?.attempted === true, `got ${r.status}`);

  r = await call("GET", "/api/wallet");
  const expected = 20 + (firstCoins > 0 ? firstCoins : 0);
  check(
    "wallet matches lesson rewards plus any challenge reward",
    r.status === 200 && r.json?.balance === expected,
    `balance ${r.json?.balance}, expected ${expected}`
  );

  r = await call("GET", "/api/community/leaderboard");
  check(
    "leaderboard answers and shows my rank",
    r.status === 200 && Array.isArray(r.json?.top) && r.json?.me?.rank !== undefined,
    `got ${r.status}`
  );

  r = await call("GET", "/api/community/profile");
  check(
    "profile shows streak 1 and 2 lessons passed",
    r.status === 200 && r.json?.profile?.streak === 1 && r.json?.profile?.lessonsPassed === 2,
    `streak ${r.json?.profile?.streak}, lessons ${r.json?.profile?.lessonsPassed}`
  );

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test could not run:", err instanceof Error ? err.message : err);
  process.exit(1);
});