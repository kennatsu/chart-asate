(() => {
  const MAX_GUESSES = 6;
  const STORAGE_KEY = "chart-guess-state";
  const STATS_KEY = "chart-guess-stats";

  // ---- 今日の問題を決める（日付ベースでローテーション） ----
  const epoch = new Date(2026, 6, 1); // 2026-07-01 を第1問とする
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayNumber = Math.max(0, Math.floor((today - epoch) / 86400000));
  const puzzle = PUZZLES[dayNumber % PUZZLES.length];
  const puzzleNo = dayNumber + 1;

  document.getElementById("puzzle-label").textContent = `#${puzzleNo}`;

  // ---- 状態 ----
  const defaultState = { day: dayNumber, guesses: [], done: false, won: false };
  let state = loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw && raw.day === dayNumber) return raw;
    } catch (_) { /* 破損時は初期化 */ }
    return { ...defaultState };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem(STATS_KEY)) || { played: 0, won: 0, streak: 0, maxStreak: 0 };
    } catch (_) {
      return { played: 0, won: 0, streak: 0, maxStreak: 0 };
    }
  }

  function recordResult(won) {
    const stats = loadStats();
    stats.played += 1;
    if (won) {
      stats.won += 1;
      stats.streak += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    } else {
      stats.streak = 0;
    }
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  // ---- チャート描画（SVG折れ線） ----
  function drawChart(series) {
    const svg = document.getElementById("chart");
    const W = 640, H = 300, PAD = 24;
    const min = Math.min(...series), max = Math.max(...series);
    const range = max - min || 1;
    const x = (i) => PAD + (i / (series.length - 1)) * (W - PAD * 2);
    const y = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2);

    const up = series[series.length - 1] >= series[0];
    const color = up ? "#4ade80" : "#f87171";
    const points = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");

    // グリッド線
    let grid = "";
    for (let g = 0; g <= 4; g++) {
      const gy = PAD + (g / 4) * (H - PAD * 2);
      grid += `<line x1="${PAD}" y1="${gy}" x2="${W - PAD}" y2="${gy}" stroke="#2e3340" stroke-width="1"/>`;
    }

    // 塗りつぶしエリア
    const areaPoints = `${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`;

    svg.innerHTML = `
      ${grid}
      <polygon points="${areaPoints}" fill="${color}" opacity="0.12"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    `;
  }

  // ---- ヒント表示 ----
  function renderHints() {
    const container = document.getElementById("hints");
    container.innerHTML = "";
    const revealCount = state.done ? puzzle.hints.length : state.guesses.length;
    puzzle.hints.forEach((h, i) => {
      const div = document.createElement("div");
      div.className = "hint" + (i < revealCount ? " revealed" : "");
      div.innerHTML = i < revealCount
        ? `<span class="hint-tag">ヒント${i + 1}｜${h.tag}</span>${escapeHtml(h.text)}`
        : `<span class="hint-tag">ヒント${i + 1}</span>🔒 外すと開放`;
      container.appendChild(div);
    });
  }

  // ---- 回答履歴表示 ----
  function renderGuesses() {
    const container = document.getElementById("guess-rows");
    container.innerHTML = "";
    state.guesses.forEach((g) => {
      const row = document.createElement("div");
      const correct = isCorrect(g);
      row.className = "guess-row " + (correct ? "correct" : "wrong");
      row.innerHTML = `<span class="mark">${correct ? "🟩" : "🟥"}</span><span>${escapeHtml(g)}</span>`;
      container.appendChild(row);
    });
  }

  // ---- 正誤判定 ----
  function normalize(s) {
    return s.trim().toLowerCase().replace(/\s+/g, "").replace(/[・･]/g, "");
  }

  function isCorrect(guess) {
    const n = normalize(guess);
    if (!n) return false;
    if (n === normalize(puzzle.answer)) return true;
    return puzzle.aliases.some((a) => normalize(a) === n);
  }

  // ---- シェアテキスト生成 ----
  function buildShareText() {
    const rows = state.guesses.map((g) => (isCorrect(g) ? "🟩" : "🟥")).join("");
    const score = state.won ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    return `チャート当て #${puzzleNo} ${score}\n${rows}\n${location.href}`;
  }

  // ---- 結果モーダル ----
  function showResult() {
    document.getElementById("result-title").textContent = state.won
      ? `正解！ ${state.guesses.length}回目で当てました 🎉`
      : "残念…また明日挑戦！";
    document.getElementById("result-answer").textContent = puzzle.answer;
    document.getElementById("result-desc").textContent = puzzle.desc;
    document.getElementById("share-preview").textContent = buildShareText();
    openModal("modal-result");
  }

  // ---- 成績モーダル ----
  function showStats() {
    const s = loadStats();
    document.getElementById("stat-played").textContent = s.played;
    document.getElementById("stat-winrate").textContent = s.played ? Math.round((s.won / s.played) * 100) + "%" : "0%";
    document.getElementById("stat-streak").textContent = s.streak;
    document.getElementById("stat-maxstreak").textContent = s.maxStreak;
    openModal("modal-stats");
  }

  // ---- モーダル共通 ----
  function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
  }

  document.querySelectorAll(".modal-backdrop").forEach((bd) => {
    bd.addEventListener("click", (e) => {
      if (e.target === bd || e.target.hasAttribute("data-close")) bd.classList.add("hidden");
    });
  });

  document.getElementById("btn-help").addEventListener("click", () => openModal("modal-help"));
  document.getElementById("btn-stats").addEventListener("click", showStats);

  // ---- 入力処理 ----
  const form = document.getElementById("guess-form");
  const input = document.getElementById("guess-input");
  const datalist = document.getElementById("companies");

  COMPANY_LIST.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    datalist.appendChild(opt);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.done) return;
    const guess = input.value.trim();
    if (!guess) return;
    if (state.guesses.some((g) => normalize(g) === normalize(guess))) {
      input.value = "";
      return;
    }

    state.guesses.push(guess);
    if (isCorrect(guess)) {
      state.done = true;
      state.won = true;
      recordResult(true);
    } else if (state.guesses.length >= MAX_GUESSES) {
      state.done = true;
      state.won = false;
      recordResult(false);
    }
    saveState();
    input.value = "";
    render();
    if (state.done) setTimeout(showResult, 400);
  });

  document.getElementById("btn-share").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      document.getElementById("copy-note").classList.remove("hidden");
    } catch (_) {
      // クリップボード不可の環境ではテキスト選択にフォールバック
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("share-preview"));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });

  // ---- util ----
  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function render() {
    renderHints();
    renderGuesses();
    const disabled = state.done;
    input.disabled = disabled;
    form.querySelector("button").disabled = disabled;
    input.placeholder = disabled ? "本日は終了。また明日！" : `企業名を入力（残り${MAX_GUESSES - state.guesses.length}回）`;
  }

  drawChart(puzzle.series);
  render();
  if (state.done) showResult();
})();
