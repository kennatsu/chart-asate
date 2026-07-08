// puzzles.js を stocks-catalog.mjs から生成する。
// 使い方: node scripts/build-puzzles.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STOCKS } from "./stocks-catalog.mjs";

function buildPuzzle(s, id) {
  return `  {
    id: ${id},
    answer: ${JSON.stringify(s.answer)},
    aliases: ${JSON.stringify(s.aliases)},
    ticker: ${JSON.stringify(s.ticker)},
    hints: [
      { tag: "セクター", text: ${JSON.stringify(s.sector)} },
      { tag: "時価総額", text: ${JSON.stringify(s.mcap + "クラス")} },
      { tag: "証券コード", text: ${JSON.stringify(s.code)} },
      { tag: "キーワード", text: ${JSON.stringify(s.keyword)} },
      { tag: "頭文字", text: ${JSON.stringify("「" + s.kana + "」から始まる")} },
    ],
    desc: ${JSON.stringify(s.desc)},
  }`;
}

const companyList = STOCKS.map((s) => JSON.stringify(s.answer)).join(", ");
const puzzles = STOCKS.map((s, i) => buildPuzzle(s, i + 1)).join(",\n");

const out = `// 自動生成ファイル。更新するには: node scripts/build-puzzles.mjs
// 銘柄の追加・編集は scripts/stocks-catalog.mjs で行う。

const COMPANY_LIST = [
  ${companyList.split(", ").join(",\n  ")},
];

const PUZZLES = [
${puzzles}
];
`;

const dest = join(dirname(fileURLToPath(import.meta.url)), "..", "chart-guess", "puzzles.js");
writeFileSync(dest, out);
console.log(`wrote ${dest} (${STOCKS.length} puzzles)`);
