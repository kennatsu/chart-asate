// 日本株の月足終値をYahoo Financeから取得し、series.js を生成する。
// 使い方: node scripts/fetch-data.mjs
// 銘柄リストは scripts/stocks-catalog.mjs から自動取得。

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STOCKS } from "./stocks-catalog.mjs";

const TICKERS = STOCKS.map((s) => s.ticker);
const MONTHS = 24;

async function fetchMonthly(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=3y&interval=1mo`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${ticker}: HTTP ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error(`${ticker}: no chart result`);

  const closes = result.indicators.quote[0].close;
  const timestamps = result.timestamp;
  const points = timestamps
    .map((ts, i) => ({ ts, close: closes[i] }))
    .filter((p) => p.close != null);

  const now = new Date();
  const currentMonthKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
  const complete = points.filter((p) => {
    const d = new Date(p.ts * 1000);
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}` !== currentMonthKey;
  });

  if (complete.length < MONTHS) throw new Error(`${ticker}: only ${complete.length} complete months`);
  const window = complete.slice(-MONTHS);

  const base = window[0].close;
  const series = window.map((p) => Math.round((p.close / base) * 10000) / 100);
  const monthLabels = window.map((p) => {
    const d = new Date(p.ts * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const lastDate = new Date(window[window.length - 1].ts * 1000);
  const asof = `${lastDate.getUTCFullYear()}-${String(lastDate.getUTCMonth() + 1).padStart(2, "0")}`;
  return { series, asof, monthLabels };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seriesMap = {};
let asof = null;
let monthLabels = null;
const failed = [];

for (const ticker of TICKERS) {
  try {
    const data = await fetchMonthly(ticker);
    seriesMap[ticker] = data.series;
    asof = data.asof;
    monthLabels = data.monthLabels;
    console.log(`${ticker}: ok (${data.series[0]} -> ${data.series[data.series.length - 1]})`);
  } catch (e) {
    failed.push({ ticker, error: e.message });
    console.error(`${ticker}: FAILED - ${e.message}`);
  }
  await sleep(350);
}

if (failed.length) {
  console.error(`\n${failed.length} ticker(s) failed:`);
  failed.forEach((f) => console.error(`  ${f.ticker}: ${f.error}`));
  process.exit(1);
}

const lines = TICKERS.map((t) => `  "${t}": [${seriesMap[t].join(", ")}],`).join("\n");
const labelsStr = monthLabels.map((l) => `"${l}"`).join(", ");
const out = `// 自動生成ファイル。更新するには: node scripts/fetch-data.mjs
// 各銘柄の直近${MONTHS}ヶ月の月足終値を起点100で指数化した実データ。
const DATA_ASOF = "${asof}";
const MONTH_LABELS = [${labelsStr}];
const SERIES = {
${lines}
};
`;

const dest = join(dirname(fileURLToPath(import.meta.url)), "..", "series.js");
writeFileSync(dest, out);
console.log(`\nwrote ${dest} (asof ${asof}, ${TICKERS.length} tickers)`);
