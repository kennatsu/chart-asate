// Fable 5 用プロンプトを生成: node scripts/generate-fable-prompt.mjs [batch 1-4]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const batchNo = Number(process.argv[2] || 1);
const inputPath = join(root, "scripts", `hints-batch-${batchNo - 1}-input.json`);
const stocks = JSON.parse(readFileSync(inputPath, "utf8"));

const prompt = `あなたは日本株クイズ「チャート当て」のヒントライターです。
以下の ${stocks.length} 銘柄について、JSON配列のみを出力してください（説明文不要）。

各銘柄の形式:
{
  "ticker": "7974.T",
  "earn": "稼ぎ方（40-80字）。企業名・コード禁止。ビジネスモデルを具体的に",
  "moat": "競争優位（30-60字）。企業名禁止",
  "clue": "関連ワード（30-60字）。製品・文化のヒント。企業名禁止",
  "events": [
    { "index": <moves[].index>, "type": "<moves[].type>", "explain": "この時点で株が動いた理由（30-70字）。例: 「AI半導体需要期待で装置株が買われた」" }
  ]
}

ルール:
- 日本語のみ
- events は入力の moves と index/type が完全一致（件数も同じ）
- チャート解説は「なぜ上がった/下がったか」をビジネス・ニュース視点で具体的に
- 汎用文（「好決算で買われた」だけ）は避け、業界固有の理由を書く

入力データ:
${JSON.stringify(stocks, null, 2)}
`;

writeFileSync(join(root, "scripts", `fable-prompt-batch-${batchNo}.txt`), prompt);
console.log(`wrote scripts/fable-prompt-batch-${batchNo}.txt (${stocks.length} stocks)`);
console.log(`→ Fable 5 に貼り付け、出力を scripts/hints-batch-${batchNo}.json として保存`);
console.log(`→ node scripts/merge-fable-hints.mjs && node scripts/build-puzzles.mjs`);
