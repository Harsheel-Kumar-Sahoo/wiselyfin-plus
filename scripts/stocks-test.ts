// Tests the stock simulator on the live site, including cheating attempts.
// Usage: npm run stockstest -- https://wiselyfin-plus.vercel.app
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!base.startsWith("http")) {
  console.error("Usage: npm run stockstest -- https://your-site.vercel.app");
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
  const email = `stocks-${Date.now()}@example.com`;
  let r;

  r = await call("GET", "/api/stocks/quotes", undefined, false);
  check("quotes without login are refused", r.status === 401, `got ${r.status}`);

  r = await call("POST", "/api/auth/signup", { name: "Stocks Test", email, password: "Test1234pass" });
  check("signup works", r.status === 201, `got ${r.status}`);

  r = await call("GET", "/api/stocks/quotes");
  check("ten quotes are returned", r.status === 200 && r.json?.quotes?.length === 10, `got ${r.status}`);
  const price: number = r.json?.quotes?.find((q: any) => q.symbol === "TCS")?.price ?? 0;
  check("prices are positive numbers", price > 0, `price ${price}`);

  r = await call("GET", "/api/stocks/portfolio");
  check("new account starts with 10,00,000 cash", r.status === 200 && r.json?.cash === 1000000, `cash ${r.json?.cash}`);

  r = await call("POST", "/api/stocks/trade", { symbol: "TCS", side: "buy", qty: 2, price: 1 });
  check(
    "a price sent by the browser is ignored",
    r.status === 200 && Math.abs((r.json?.trade?.price ?? 0) - price) < price * 0.2 && r.json?.trade?.price !== 1,
    `price ${r.json?.trade?.price}`
  );

  r = await call("POST", "/api/stocks/trade", { symbol: "TCS", side: "buy", qty: 0 });
  check("zero quantity is rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/stocks/trade", { symbol: "TCS", side: "buy", qty: 1.5 });
  check("fractional quantity is rejected", r.status === 400, `got ${r.status}`);
  r = await call("POST", "/api/stocks/trade", { symbol: "FAKE", side: "buy", qty: 1 });
  check("unknown symbol is rejected", r.status === 400, `got ${r.status}`);

  r = await call("POST", "/api/stocks/trade", { symbol: "TCS", side: "buy", qty: 10000 });
  check("buying more than the cash allows is refused", r.status === 400 && r.json?.error?.code === "NOT_ENOUGH_CASH", `got ${r.status}`);

  r = await call("POST", "/api/stocks/trade", { symbol: "TCS", side: "sell", qty: 5 });
  check("selling more than owned is refused", r.status === 400 && r.json?.error?.code === "NOT_ENOUGH_SHARES", `got ${r.status}`);

  r = await call("POST", "/api/stocks/trade", { symbol: "INFY", side: "sell", qty: 1 });
  check("selling a share never owned is refused", r.status === 400, `got ${r.status}`);

  r = await call("GET", "/api/stocks/portfolio");
  check(
    "portfolio shows 2 TCS shares",
    r.status === 200 && r.json?.holdings?.length === 1 && r.json?.holdings?.[0]?.qty === 2,
    JSON.stringify(r.json?.holdings)
  );
  const cashAfterBuy: number = r.json?.cash ?? 0;

  r = await call("POST", "/api/stocks/trade", { symbol: "TCS", side: "sell", qty: 2 });
  check("selling the shares works", r.status === 200, `got ${r.status}`);

  r = await call("GET", "/api/stocks/portfolio");
  check(
    "holdings are empty and cash came back",
    r.status === 200 && r.json?.holdings?.length === 0 && r.json?.cash > cashAfterBuy,
    `holdings ${r.json?.holdings?.length}, cash ${r.json?.cash}`
  );

  r = await call("GET", "/api/stocks/trades");
  check("the ledger shows exactly 2 trades (buy and sell)", r.status === 200 && r.json?.trades?.length === 2, `rows ${r.json?.trades?.length}`);

  r = await call("GET", "/api/wallet");
  check("trading never changes FinCoins", r.status === 200 && r.json?.balance === 0, `balance ${r.json?.balance}`);

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test could not run:", err instanceof Error ? err.message : err);
  process.exit(1);
});