// 銘柄×チャート変動の「なぜ？」解説
// Fable 5 再生成時は hints-batch-*.json → merge-fable-hints.mjs

export const CHART_EXPLAIN_OVERRIDES = {
  "7974.T": {
    10: "Switch2発表後の期待感で一時急騰したが、その後は本体価格への懸念が表面化",
    16: "Switch2の価格設定とソフト投入ペースへの失望から、期待剥落売りが加速",
  },
  "8035.T": {
    14: "AI・データセンター向け需要の期待で買われた",
    22: "AIブームで最高値圏へ。HBM向けエッチング装置の需要急増",
  },
  "9983.T": {
    14: "好決算と海外売上高の伸びで一時急騰。円安効果もプラス",
  },
  "7011.T": {
    14: "防衛費増額を受けて防衛関連株として買われ、一時240%超まで急騰",
  },
  "8306.T": {
    17: "日銀利上げ観測が強まり、金利上昇メリットでメガバンク株が急伸",
  },
  "6861.T": {
    20: "設備投資サイクル回復期待で反発。ただし高値警戒感も",
  },
  "9501.T": {
    12: "原発再稼働期待と電力需給ひっ迫で一時100%超まで急騰",
  },
  "4385.T": {
    18: "黒字化期待とメルペイ成長で反発。フリマ事業の収益改善",
  },
  "6857.T": {
    11: "AI半導体テスト需要の期待で急伸",
  },
};

// 2024-07〜2026-06 のマクロ・セクターイベント（index = MONTH_LABELS の添字）
const MACRO = {
  1: { up: "円安進行で輸出関連に買い", down: "円高修正で輸出株に売り" },
  4: { up: "米国金利低下観測でリスクオン", down: "米国景気減速懸念で売り優勢" },
  7: { up: "年初来高値更新の流れで追い買い", down: "年初来安値圏への調整売り" },
  8: { up: "好決算シーズン前の期待買い", down: "決算前の利益確定売り" },
  9: { up: "日銀利上げ観測で金利敏感株に資金流入", down: "日銀タカ派懸念でグロース株に売り" },
  10: { up: "AI関連の設備投資期待が再燃", down: "AIバブル警戒感でハイテクに調整" },
  11: { up: "半導体・AI関連の決算好調で買い", down: "半導体在庫懸念で装置株に売り" },
  12: { up: "夏季需要・原発関連の話題で買われた", down: "夏季需要の失望で売られた" },
  13: { up: "8月暴落後のリバウンドで買い戻し", down: "8月の急落余波でリスクオフ" },
  14: { up: "AI・データセンター投資テーマが加速", down: "米中摩擦・関税懸念で売り" },
  15: { up: "好決算と年末に向けたリスクオン", down: "材料出尽くしで利益確定" },
  16: { up: "米大統領選後の政策期待で買い", down: "政策不透明感で調整売り" },
  17: { up: "年末・年始の日銀利上げ観測で金融株に買い", down: "年末のポジション整理売り" },
  18: { up: "年初の好決算期待で買い", down: "年初の利益確定売り" },
  19: { up: "春の決算・政策期待で反発", down: "決算失望やマクロ不安で売り" },
  20: { up: "新年度・設備投資期待で買われた", down: "新年度の見通し下方修正で売り" },
  21: { up: "春闘・政策期待で内需株に買い", down: "人件費・原材料高の懸念で売り" },
  22: { up: "AI関連の最高値更新ムードで買い", down: "高値圏での警戒売り" },
};

function driverTheme(driver) {
  if (!driver) return null;
  const parts = driver.split(/[。、]/).map((s) => s.trim()).filter(Boolean);
  const theme = parts.length >= 2 ? `${parts[0]}・${parts[1]}` : parts[0];
  if (!theme || theme.length < 6) return null;
  return theme.length > 42 ? theme.slice(0, 40) + "…" : theme;
}

function sectorFallback(stock, move) {
  const s = stock.sector;
  const up = move.type === "rise";
  if (/半導体|装置|エレクトロン/.test(s)) {
    return up
      ? "AI・データセンター向け需要の期待で買われた"
      : "半導体サイクルの減速懸念や、顧客の設備投資見直し";
  }
  if (/ゲーム/.test(s)) {
    return up ? "新作ヒットや好決算で期待感が拡大" : "新作の期待剥落や、ハード・ソフト売上の減速";
  }
  if (/銀行|金融|保険/.test(s)) {
    return up ? "日銀利上げ観測で金利上昇メリットが意識" : "金利低下懸念や、貸倒れ・市場変動の不安";
  }
  if (/自動車|部品/.test(s)) {
    return up ? "北米販売好調や円安効果で業績改善期待" : "EV転換コストや、中国・北米の需要減速";
  }
  if (/医薬|製薬/.test(s)) {
    return up ? "新薬の治験好結果や承認期待" : "治験失敗・承認遅延、または材料出尽くし";
  }
  if (/商社|鉄鋼|資源/.test(s)) {
    return up ? "資源価格上昇や、インフラ投資期待" : "資源価格下落や、世界景気の減速懸念";
  }
  if (/小売|アパレル/.test(s)) {
    return up ? "好決算・増配や、インバウンド回復" : "中国消費減速や、天候不順による需要減";
  }
  if (/通信|IT|SaaS/.test(s)) {
    return up ? "新サービス成長や、コスト削減効果" : "成長鈍化や、競争激化による収益圧迫";
  }
  if (/重工|防衛|機械/.test(s)) {
    return up ? "防衛費増額・設備投資拡大の追い風" : "受注減や、原材料・人件費高の圧迫";
  }
  if (/航空|鉄道|海運/.test(s)) {
    return up ? "インバウンド回復や、運賃・利用者数の改善" : "燃油高・需要減速や、人件費増の圧迫";
  }
  return up
    ? "好決算や業界ポジティブニュースで買われた"
    : "業績下方修正やマクロ不安で売られた";
}

function macroHint(move) {
  const m = MACRO[move.index];
  if (!m) return null;
  return move.type === "rise" ? m.up : m.down;
}

function driverHint(move, driver) {
  const theme = driverTheme(driver);
  if (!theme) return null;
  if (move.type === "rise") {
    return `${theme}の改善期待が広がり、買いが入った`;
  }
  return `${theme}への懸念が強まり、売りが優勢になった`;
}

export function explainMove(stock, move, driver = null) {
  const byTicker = CHART_EXPLAIN_OVERRIDES[stock.ticker];
  if (byTicker?.[move.index]) return byTicker[move.index];

  const fromDriver = driverHint(move, driver);
  const fromMacro = macroHint(move);
  const fromSector = sectorFallback(stock, move);

  if (fromDriver) return fromDriver;
  if (fromMacro) return fromMacro;
  return fromSector;
}
