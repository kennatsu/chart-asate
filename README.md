# チャート当て（chart-asate）

毎日1問、日本株チャートから企業名を当てるデイリークイズ。

**公開URL:** https://kennatsu.github.io/chart-asate/

> 将来的に独自ドメイン（例: `chart-asate.app`）を設定予定。GitHub Pages の Custom domain で切り替え可能。

## 方針

- 毎日1問（JST 0:00）・6回チャンス・結果シェア
- 静的ホスティング（GitHub Pages）のみで運用

## データ更新

株価データは Yahoo Finance から取得。銘柄マスタは `scripts/stocks-catalog.mjs`。

```bash
node scripts/fetch-data.mjs          # series.js 更新
node scripts/build-smart-hints.mjs   # ヒント再生成
node scripts/build-puzzles.mjs       # puzzles.js 更新
```

毎月2日 03:00 JST に GitHub Actions が自動更新（`.github/workflows/update-stock-data.yml`）。

### ヒントの再生成（Fable 5 推奨）

1. `node scripts/export-for-hints.mjs`
2. `node scripts/generate-fable-prompt.mjs 1`（バッチ1〜4）
3. Fable 5 → `scripts/hints-batch-N.json`
4. `node scripts/merge-fable-hints.mjs`
5. `node scripts/build-puzzles.mjs`
