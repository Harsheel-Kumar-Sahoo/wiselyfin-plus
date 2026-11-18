// Tests the budget tracker and goals on the live site, including privacy between two users.
// Usage: npm run budgettest -- https://wiselyfin-plus.vercel.app
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base.startsWith("http")) {
  console.error("Usage: npm run budgettest -- https://your-site.vercel.app");
  process.exit(1);
}

// Each person gets their own cookie jar, so we can act as two different users.
function makeClient() {
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

  return async function call(method: string, path: string, body?: unknown, useCookies = true) {
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
  };
}

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + detail}`);
  if (!ok) failed += 1;
}

async function main() {
  const alice = makeClient();
  const bob = makeClient();
  const stamp = Date.now();
  const month = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 7);
  const day = `${month}-15`;
  let r;

  r = await alice("GET", `/api/budget/entries?month=${month}`, undefined, false);
  check("entries without login are refused", r.status === 401, `got ${r.status}`);

  r = await alice("POST", "/api/auth/signup", { name: "Alice Budget", email: `alice-${stamp}@example.com`, password: "Test1234pass" });
  check("first user signs up", r.status === 201, `got ${r.status}`);
  r = await bob("POST", "/api/auth/signup", { name: "Bob Budget", email: `bob-${stamp}@example.com`, password: "Test1234pass" });
  check("second user signs up", r.status === 201, `got ${r.status}`);

  r = await alice("POST", "/api/budget/entries", { type: "income", amount: 50000, category: "salary", note: "", day });
  check("income entry is saved", r.status === 201, `got ${r.status}`);
  r = await alice("POST", "/api/budget/entries", { type: "expense", amount: 1200.5, category: "food", note: "lunch", day });
  check("expense entry is saved", r.status === 201, `got ${r.status}`);
  const expenseId = r.json?.id as string;

  r = await alice("POST", "/api/budget/entries", { type: "expense", amount: -5, category: "food", note: "", day });
  check("negative amount is rejected", r.status === 400, `got ${r.status}`);
  r = await alice("POST", "/api/budget/entries", { type: "expense", amount: 10, category: "hacking", note: "", day });
  check("unknown category is rejected", r.status === 400, `got ${r.status}`);
  r = await alice("POST", "/api/budget/entries", { type: "expense", amount: 10, category: "food", note: "<script>x</script>", day });
  check("angle brackets in notes are rejected", r.status === 400, `got ${r.status}`);

  r = await alice("GET", `/api/budget/entries?month=${month}`);
  check(
    "totals are correct (income 50000, spent 1200.5)",
    r.status === 200 && r.json?.totals?.income === 50000 && r.json?.totals?.spent === 1200.5 && r.json?.totals?.balance === 48799.5,
    JSON.stringify(r.json?.totals)
  );

  r = await bob("GET", `/api/budget/entries?month=${month}`);
  check("the second user sees none of the first user's entries", r.status === 200 && r.json?.entries?.length === 0, `rows ${r.json?.entries?.length}`);

  r = await bob("DELETE", `/api/budget/entries/${expenseId}`);
  r = await alice("GET", `/api/budget/entries?month=${month}`);
  check("another user cannot delete my entry", r.status === 200 && r.json?.entries?.length === 2, `rows ${r.json?.entries?.length}`);

  r = await alice("DELETE", `/api/budget/entries/${expenseId}`);
  r = await alice("GET", `/api/budget/entries?month=${month}`);
  check("I can delete my own entry", r.status === 200 && r.json?.entries?.length === 1, `rows ${r.json?.entries?.length}`);

  r = await alice("POST", "/api/budget/goals", { name: "Phone", target: 20000, targetDay: "" });
  check("goal is created", r.status === 201, `got ${r.status}`);
  const goalId = r.json?.id as string;

  r = await alice("POST", `/api/budget/goals/${goalId}/add`, { amount: 5000 });
  check("money is added to the goal", r.status === 200, `got ${r.status}`);
  r = await bob("POST", `/api/budget/goals/${goalId}/add`, { amount: 5000 });
  check("another user cannot add money to my goal", r.status === 404, `got ${r.status}`);

  r = await alice("GET", "/api/budget/goals");
  check("goal shows 5000 saved of 20000", r.status === 200 && r.json?.goals?.[0]?.saved === 5000 && r.json?.goals?.[0]?.target === 20000, JSON.stringify(r.json?.goals));

  r = await alice("GET", "/api/wallet");
  check("goals and entries never give FinCoins", r.status === 200 && r.json?.balance === 0, `balance ${r.json?.balance}`);

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test could not run:", err instanceof Error ? err.message : err);
  process.exit(1);
});