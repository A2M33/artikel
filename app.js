/*
 * artikel: der/die/das trainer.
 *
 * Plain script (no modules) so the page also works when opened from disk.
 * Expects words.js to be loaded first; it defines window.WORDS.
 *
 * Scheduling is a turn-based Leitner system. Every answer is one "turn".
 * A word in box b comes back GAP[b] turns after it was last answered.
 * A right answer moves the word up one box; a wrong one sends it to box 1.
 */
(function () {
  "use strict";

  var WORDS = window.WORDS || [];
  var STORE_KEY = "artikel.progress.v1";
  var ARTICLES = ["der", "die", "das"];
  var LEVELS = ["A1", "A2", "B1", "all"];
  var LANGS = ["en", "fa"];
  var BOXES = 5;
  var GAP = [0, 2, 5, 12, 30, 70];
  // New words wait while this many missed words sit in box 1.
  var MAX_LEARNING = 10;
  var FIRST_TRY_BOX = 3;
  var NO_PLURAL = "–";
  var GOALS = [10, 20, 30, 50];
  var MISSED_SHOWN = 8;
  // Answer keys by physical position (e.code), so they also work with a
  // Persian or other non-Latin keyboard layout. D, I, S: der, die, das.
  var ANSWER_KEYS = {
    Digit1: 0, Numpad1: 0, KeyD: 0,
    Digit2: 1, Numpad2: 1, KeyI: 1,
    Digit3: 2, Numpad3: 2, KeyS: 2
  };
  var DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

  // ---------------------------------------------------------------- text

  // Interface text. {name} marks a slot; numbers in slots get Persian digits
  // in Persian mode. German words stay German in both languages.
  var TEXT = {
    en: {
      title: "artikel: der, die or das?",
      skip: "Skip to the game",
      level: "Level",
      levelAll: "All",
      lang: "Language",
      sound: "Say the word aloud",
      stats: "Stats",
      choose: "Choose the article",
      next: "Next word",
      keys: "Keys",
      orKey: "or",
      keysAnswer: "answer,",
      keysNext: "moves on.",
      daily: "Daily goal",
      today: "Today",
      score: "Score",
      correct: "Correct",
      streak: "Streak",
      best: "Best",
      boxTitle: "Card box",
      boxNote: "Right answers move a word one box up. A miss sends it back to box 1, so you see it again soon. Box 5 means mastered.",
      boxNew: "new",
      foot: "Your progress stays in this browser. Nothing is sent anywhere.",
      statsTitle: "Your stats",
      close: "Close",
      byArticle: "Accuracy by article",
      masteredTotal: "words mastered",
      answersTotal: "answers so far",
      missedTitle: "Most missed",
      missedEmpty: "No misses yet.",
      goalNote: "Cards a day. Meet the goal on days in a row to build a streak.",
      byLevel: "By level",
      colSeen: "Seen",
      colMastered: "Mastered",
      reset: "Reset progress",
      resetArmed: "Tap again to erase all progress",
      resetNote: "Clears boxes, score and stats on this device.",
      erased: "Progress erased.",
      noWords: "No words for this level",
      missingArticle: "missing article",
      newWord: "New word",
      boxOf: "Box {b} of {total}",
      nowBox: "Now in box {b} of {total}",
      right: "Richtig.",
      wrong: "Not {chosen}. It is {answer}.",
      plural: "Plural: {pl}",
      noPlural: "No plural",
      mastered: "Mastered",
      liveRight: "Correct.",
      liveWrong: "Wrong.",
      liveMastered: "Mastered.",
      liveGoal: "Daily goal reached.",
      count: "{n} / {total}",
      dayOne: "day in a row",
      days: "days in a row",
      cellNew: "New",
      cellBox: "Box {b}",
      wordOne: "{n} word",
      words: "{n} words",
      currentWord: ", current word",
      meterRight: "{a}: {p}% correct",
      meterNone: "{a}: not asked yet",
      percent: "{p}%",
      okOf: "{ok} of {n}",
      noAnswers: "no answers yet",
      missOne: "{m} miss",
      misses: "{m} misses",
      inBox: "box {b}",
      listSep: ", ",
      or: " or "
    },
    fa: {
      title: "artikel: der، die یا das؟",
      skip: "رفتن به بازی",
      level: "سطح",
      levelAll: "همه",
      lang: "زبان",
      sound: "خواندن واژه با صدا",
      stats: "آمار",
      choose: "حرف تعریف را انتخاب کنید",
      next: "واژهٔ بعدی",
      keys: "کلیدهای",
      orKey: "یا",
      keysAnswer: "برای پاسخ،",
      keysNext: "برای واژهٔ بعدی.",
      daily: "هدف روزانه",
      today: "امروز",
      score: "امتیاز",
      correct: "درست",
      streak: "پیاپی",
      best: "بهترین",
      boxTitle: "جعبهٔ کارت‌ها",
      boxNote: "با هر پاسخ درست، واژه یک جعبه بالا می‌رود. با هر اشتباه به جعبهٔ ۱ برمی‌گردد تا زود دوباره آن را ببینید. جعبهٔ ۵ یعنی واژه را یاد گرفته‌اید.",
      boxNew: "تازه",
      foot: "پیشرفت شما فقط در همین مرورگر می‌ماند و به هیچ جا فرستاده نمی‌شود.",
      statsTitle: "آمار شما",
      close: "بستن",
      byArticle: "درستی پاسخ برای هر حرف تعریف",
      masteredTotal: "واژهٔ یادگرفته",
      answersTotal: "پاسخ تا اینجا",
      missedTitle: "بیشترین اشتباه‌ها",
      missedEmpty: "هنوز اشتباهی نداشته‌اید.",
      goalNote: "کارت در روز. هر روز به هدف برسید تا شمار روزهای پیاپی بالا برود.",
      byLevel: "به تفکیک سطح",
      colSeen: "دیده‌شده",
      colMastered: "یادگرفته",
      reset: "پاک کردن پیشرفت",
      resetArmed: "برای پاک کردن همهٔ پیشرفت دوباره بزنید",
      resetNote: "جعبه‌ها، امتیاز و آمار را در این دستگاه پاک می‌کند.",
      erased: "پیشرفت پاک شد.",
      noWords: "برای این سطح واژه‌ای نیست",
      missingArticle: "حرف تعریف خالی",
      newWord: "واژهٔ تازه",
      boxOf: "جعبهٔ {b} از {total}",
      nowBox: "حالا در جعبهٔ {b} از {total}",
      right: "درست است.",
      wrong: "{chosen} نه، {answer} درست است.",
      plural: "جمع: {pl}",
      noPlural: "جمع ندارد",
      mastered: "یاد گرفتید",
      liveRight: "درست.",
      liveWrong: "نادرست.",
      liveMastered: "این واژه را یاد گرفتید.",
      liveGoal: "به هدف امروز رسیدید.",
      count: "{n} از {total}",
      dayOne: "روز پیاپی",
      days: "روز پیاپی",
      cellNew: "تازه",
      cellBox: "جعبهٔ {b}",
      wordOne: "{n} واژه",
      words: "{n} واژه",
      currentWord: "، واژهٔ فعلی",
      meterRight: "{a}: {p}٪ درست",
      meterNone: "{a}: هنوز پرسیده نشده",
      percent: "{p}٪",
      okOf: "{ok} از {n}",
      noAnswers: "هنوز پاسخی نیست",
      missOne: "{m} اشتباه",
      misses: "{m} اشتباه",
      inBox: "جعبهٔ {b}",
      listSep: "، ",
      or: " یا "
    }
  };

  var FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

  function t(key) {
    var table = TEXT[state.lang] || TEXT.en;
    return key in table ? table[key] : TEXT.en[key];
  }

  function num(n) {
    var s = String(n);
    if (state.lang !== "fa") return s;
    return s.replace(/[0-9]/g, function (d) { return FA_DIGITS.charAt(Number(d)); });
  }

  // Splits a template into text and values, in order. Numbers are localised;
  // DOM nodes pass through so callers can append them.
  function parts(key, vars) {
    var out = [];
    t(key).split(/(\{\w+\})/).forEach(function (piece) {
      var m = /^\{(\w+)\}$/.exec(piece);
      if (!m) {
        if (piece) out.push(piece);
        return;
      }
      var v = vars[m[1]];
      out.push(typeof v === "number" ? num(v) : v);
    });
    return out;
  }

  function fmt(key, vars) {
    return parts(key, vars || {}).join("");
  }

  // ---------------------------------------------------------------- rules

  // rules.js holds the gender rules; tests/rules.test.mjs checks them.
  var ruleFor = window.RULES ? window.RULES.ruleFor : function () { return null; };

  // ---------------------------------------------------------------- state

  function emptyStats() {
    return { der: { n: 0, ok: 0 }, die: { n: 0, ok: 0 }, das: { n: 0, ok: 0 } };
  }

  function defaults() {
    return {
      v: 1,
      turn: 0,
      prog: {},
      stats: emptyStats(),
      answered: 0,
      correct: 0,
      streak: 0,
      best: 0,
      level: "A1",
      lang: "en",
      sound: true,
      goal: 20,
      // Cards answered on day d (local date, YYYY-MM-DD).
      today: { d: "", n: 0 },
      // Days in a row the goal was met, ending on goalDay.
      days: 0,
      goalDay: ""
    };
  }

  function isCount(n) {
    return typeof n === "number" && isFinite(n) && n >= 0;
  }

  function load() {
    var s = defaults();
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORE_KEY);
    } catch (e) {
      return s;
    }
    if (!raw) return s;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return s;
    }
    if (!data || typeof data !== "object") return s;

    ["turn", "answered", "correct", "streak", "best", "days"].forEach(function (k) {
      if (isCount(data[k])) s[k] = Math.floor(data[k]);
    });
    if (LEVELS.indexOf(data.level) !== -1) s.level = data.level;
    if (LANGS.indexOf(data.lang) !== -1) s.lang = data.lang;
    if (typeof data.sound === "boolean") s.sound = data.sound;
    if (GOALS.indexOf(data.goal) !== -1) s.goal = data.goal;
    if (typeof data.goalDay === "string" && DAY_RE.test(data.goalDay)) s.goalDay = data.goalDay;
    if (data.today && DAY_RE.test(data.today.d) && isCount(data.today.n)) {
      s.today = { d: data.today.d, n: Math.floor(data.today.n) };
    }
    if (data.stats && typeof data.stats === "object") {
      ARTICLES.forEach(function (a) {
        var st = data.stats[a];
        if (st && isCount(st.n) && isCount(st.ok)) s.stats[a] = { n: st.n, ok: Math.min(st.ok, st.n) };
      });
    }
    if (data.prog && typeof data.prog === "object") {
      Object.keys(data.prog).forEach(function (w) {
        var p = data.prog[w];
        if (p && isCount(p.b) && isCount(p.n) && p.b >= 1 && p.b <= BOXES) {
          s.prog[w] = { b: Math.floor(p.b), n: Math.floor(p.n) };
          // m = misses, added later; older saves don't have it.
          if (isCount(p.m)) s.prog[w].m = Math.floor(p.m);
        }
      });
    }
    return s;
  }

  function save() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage can be blocked (private mode, some file:// setups). The game
      // still works for this visit.
    }
  }

  var state = load();
  var current = null;
  var hasAnswered = false;
  // The last answer, kept so a language switch can redraw the feedback.
  var last = null;

  // ---------------------------------------------------------------- picking

  function pool() {
    if (state.level === "all") return WORDS;
    return WORDS.filter(function (w) { return w.lvl === state.level; });
  }

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function pickNext() {
    var all = pool();
    if (!all.length) return null;
    var lastWord = current ? current.w : null;
    var candidates = all.length > 1
      ? all.filter(function (w) { return w.w !== lastWord; })
      : all;

    var due = [];
    var fresh = [];
    var seen = [];
    var learning = 0;
    candidates.forEach(function (w) {
      var p = state.prog[w.w];
      if (!p) {
        fresh.push(w);
        return;
      }
      seen.push(w);
      if (p.b === 1) learning++;
      if (p.n <= state.turn) due.push(w);
    });

    var canAddNew = fresh.length > 0 && learning < MAX_LEARNING;
    // Reviews win most of the time, but not always: a few stubborn misses
    // would otherwise come back every other card and block new words.
    if (due.length && (!canAddNew || Math.random() < 0.7)) {
      // Lowest box first, then the longest overdue. A little randomness
      // among the top few keeps the order from feeling mechanical.
      due.sort(function (x, y) {
        var px = state.prog[x.w];
        var py = state.prog[y.w];
        return px.b - py.b || px.n - py.n;
      });
      return due[Math.floor(Math.random() * Math.min(3, due.length))];
    }
    if (canAddNew) return randomItem(fresh);
    if (seen.length) {
      seen.sort(function (x, y) { return state.prog[x.w].n - state.prog[y.w].n; });
      return seen[0];
    }
    return randomItem(fresh.length ? fresh : candidates);
  }

  // ---------------------------------------------------------------- DOM

  function $(id) { return document.getElementById(id); }

  var el = {
    card: $("card"),
    slot: $("slot"),
    noun: $("noun"),
    wordLevel: $("word-level"),
    wordBox: $("word-box"),
    choices: Array.prototype.slice.call(document.querySelectorAll(".choice")),
    feedback: $("feedback"),
    verdict: $("verdict"),
    plural: $("plural"),
    meaning: $("meaning"),
    hint: $("hint"),
    next: $("next"),
    statCorrect: $("stat-correct"),
    statStreak: $("stat-streak"),
    statBest: $("stat-best"),
    boxCells: Array.prototype.slice.call(document.querySelectorAll(".box-cell")),
    boxCaption: $("box-caption"),
    levelInputs: Array.prototype.slice.call(document.querySelectorAll('input[name="level"]')),
    langInputs: Array.prototype.slice.call(document.querySelectorAll('input[name="lang"]')),
    statsOpen: $("stats-open"),
    statsDialog: $("stats"),
    statsClose: $("stats-close"),
    statsArticles: $("stats-articles"),
    statsLevels: $("stats-levels"),
    statsMastered: $("stats-mastered"),
    statsAnswered: $("stats-answered"),
    statsMissed: $("stats-missed"),
    statsMissedEmpty: $("stats-missed-empty"),
    reset: $("reset"),
    sound: $("sound"),
    daily: $("daily"),
    dailyCount: $("daily-count"),
    dailyMeter: $("daily-meter"),
    dailyFill: $("daily-fill"),
    dailyDays: $("daily-days"),
    dailyDaysLabel: $("daily-days-label"),
    goalInputs: Array.prototype.slice.call(document.querySelectorAll('input[name="goal"]')),
    live: $("live")
  };

  function setText(node, text) {
    if (node) node.textContent = text;
  }

  function boxOf(word) {
    var p = word && state.prog[word.w];
    return p ? p.b : 0;
  }

  // ---------------------------------------------------------------- render

  function renderWord() {
    if (!current) {
      setText(el.noun, t("noWords"));
      setText(el.slot, "");
      el.choices.forEach(function (b) { b.disabled = true; });
      return;
    }
    el.card.removeAttribute("data-article");
    el.card.style.setProperty("--len", String(current.w.length));
    el.slot.textContent = "";
    el.slot.removeAttribute("data-article");
    el.slot.setAttribute("aria-label", t("missingArticle"));
    el.noun.textContent = current.w;
    setText(el.wordLevel, current.lvl);
    var b = boxOf(current);
    renderWordBox();

    el.choices.forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove("is-correct", "is-wrong");
      btn.removeAttribute("aria-describedby");
    });
    el.feedback.hidden = true;
    el.card.classList.remove("is-answered");
    renderBox(b);
  }

  function renderWordBox() {
    if (!current) return;
    if (hasAnswered && last) {
      setText(el.wordBox, fmt("nowBox", { b: last.box, total: BOXES }));
      return;
    }
    var b = boxOf(current);
    setText(el.wordBox, b ? fmt("boxOf", { b: b, total: BOXES }) : t("newWord"));
  }

  function renderMeaning() {
    if (!current) return;
    var fa = state.lang === "fa";
    el.meaning.textContent = fa ? current.fa : current.en;
    el.meaning.lang = fa ? "fa" : "en";
    el.meaning.dir = fa ? "rtl" : "ltr";
    renderHint();
  }

  function renderHint() {
    var wrong = el.card.getAttribute("data-result") === "wrong";
    var rule = current && wrong ? ruleFor(current) : null;
    el.hint.textContent = "";
    if (!rule) {
      el.hint.hidden = true;
      return;
    }
    var fa = state.lang === "fa";
    el.hint.lang = fa ? "fa" : "en";
    el.hint.dir = fa ? "rtl" : "ltr";
    el.hint.setAttribute("data-article", current.a);

    // -nis allows two articles; the hint names both.
    var arts = typeof rule.a === "string" ? [rule.a] : rule.a;
    var art = artNode(arts[0]);
    var or = t("or");
    var artText = arts.length > 1 ? [art, or, artNode(arts[1])] : [art];

    if (rule.time) {
      if (fa) {
        el.hint.append("نام روزها، ماه‌ها و فصل‌ها با ", art, " می‌آیند.");
      } else {
        el.hint.append("Days, months and seasons take ", art, ".");
      }
    } else if (rule.prefix) {
      var pre = germanSpan("suffix", rule.prefix + "-");
      if (fa) {
        el.hint.append("بسیاری از اسم‌هایی که با ", pre, " شروع می‌شوند با ", art, " می‌آیند.");
      } else {
        el.hint.append("Many nouns starting with ", pre, " take ", art, ".");
      }
    } else {
      var suf = germanSpan("suffix", "-" + rule.suffix);
      var most = rule.hedge === "usually";
      if (fa) {
        el.hint.append(most ? "بیشتر اسم‌هایی که به " : "اسم‌هایی که به ", suf, " ختم می‌شوند با ");
        el.hint.append.apply(el.hint, artText);
        el.hint.append(" می‌آیند.");
      } else {
        el.hint.append(most ? "Most nouns ending in " : "Nouns ending in ", suf, " take ");
        el.hint.append.apply(el.hint, artText);
        el.hint.append(".");
      }
    }
    el.hint.hidden = false;
  }

  function germanSpan(className, text) {
    var node = document.createElement("span");
    node.lang = "de";
    node.dir = "ltr";
    node.className = className;
    node.textContent = text;
    return node;
  }

  function artNode(article) {
    var node = document.createElement("b");
    node.lang = "de";
    node.dir = "ltr";
    node.className = "art art-" + article;
    node.textContent = article;
    return node;
  }

  function renderScore() {
    setText(el.statCorrect, fmt("count", { n: state.correct, total: state.answered }));
    setText(el.statStreak, num(state.streak));
    setText(el.statBest, num(state.best));
  }

  function boxCounts() {
    var counts = [0, 0, 0, 0, 0, 0];
    pool().forEach(function (w) {
      var p = state.prog[w.w];
      counts[p ? p.b : 0]++;
    });
    return counts;
  }

  function renderBox(activeBox) {
    var counts = boxCounts();
    el.boxCells.forEach(function (cell) {
      var i = Number(cell.getAttribute("data-box"));
      var countNode = cell.querySelector(".box-count");
      setText(countNode, num(counts[i]));
      cell.classList.toggle("is-active", i === activeBox);
      var label = (i === 0 ? t("cellNew") : fmt("cellBox", { b: i })) + ": " +
        fmt(counts[i] === 1 ? "wordOne" : "words", { n: counts[i] });
      if (i === activeBox) label += t("currentWord");
      cell.setAttribute("aria-label", label);
    });
  }

  // ---------------------------------------------------------------- daily goal

  function dayKey(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return date.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d;
  }

  function todayKey() {
    return dayKey(new Date());
  }

  function yesterdayKey() {
    var now = new Date();
    return dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }

  function cardsToday() {
    return state.today.d === todayKey() ? state.today.n : 0;
  }

  // The streak survives until the end of the day after it was last met.
  function dayStreak() {
    var g = state.goalDay;
    return g && (g === todayKey() || g === yesterdayKey()) ? state.days : 0;
  }

  // Returns true when this call is the one that met today's goal.
  function checkGoal() {
    var today = todayKey();
    if (state.goalDay === today || cardsToday() < state.goal) return false;
    state.days = state.goalDay === yesterdayKey() ? state.days + 1 : 1;
    state.goalDay = today;
    return true;
  }

  function countCard() {
    var today = todayKey();
    if (state.today.d !== today) state.today = { d: today, n: 0 };
    state.today.n++;
    return checkGoal();
  }

  function renderDaily() {
    var n = cardsToday();
    var done = n >= state.goal;
    setText(el.dailyCount, fmt("count", { n: n, total: state.goal }));
    el.dailyFill.style.width = Math.min(100, (n / state.goal) * 100) + "%";
    el.dailyMeter.setAttribute("aria-valuemax", String(state.goal));
    el.dailyMeter.setAttribute("aria-valuenow", String(Math.min(n, state.goal)));
    el.daily.classList.toggle("is-done", done);
    var days = dayStreak();
    setText(el.dailyDays, num(days));
    setText(el.dailyDaysLabel, t(days === 1 ? "dayOne" : "days"));
  }

  function setGoal(goal) {
    if (GOALS.indexOf(goal) === -1) return;
    state.goal = goal;
    checkGoal();
    save();
    renderDaily();
  }

  function pct(ok, n) {
    return n ? Math.round((ok / n) * 100) : 0;
  }

  function renderStats() {
    el.statsArticles.textContent = "";
    ARTICLES.forEach(function (a) {
      var st = state.stats[a];
      var p = pct(st.ok, st.n);
      var row = document.createElement("div");
      row.className = "meter-row";
      row.setAttribute("data-article", a);

      var name = document.createElement("span");
      name.className = "meter-name art art-" + a;
      name.lang = "de";
      name.textContent = a;

      var bar = document.createElement("span");
      bar.className = "meter";
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", st.n ? fmt("meterRight", { a: a, p: p }) : fmt("meterNone", { a: a }));
      var fill = document.createElement("span");
      fill.className = "meter-fill";
      fill.style.width = p + "%";
      bar.appendChild(fill);

      var value = document.createElement("span");
      value.className = "meter-value";
      value.textContent = st.n ? fmt("percent", { p: p }) : "–";
      var detail = document.createElement("span");
      detail.className = "meter-detail";
      detail.textContent = st.n ? fmt("okOf", { ok: st.ok, n: st.n }) : t("noAnswers");

      row.append(name, bar, value, detail);
      el.statsArticles.appendChild(row);
    });

    var mastered = 0;
    el.statsLevels.textContent = "";
    ["A1", "A2", "B1"].forEach(function (lvl) {
      var words = WORDS.filter(function (w) { return w.lvl === lvl; });
      var m = 0;
      var seen = 0;
      words.forEach(function (w) {
        var p = state.prog[w.w];
        if (p) seen++;
        if (p && p.b === BOXES) m++;
      });
      mastered += m;
      var row = document.createElement("tr");
      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = lvl;
      var tdSeen = document.createElement("td");
      tdSeen.textContent = fmt("count", { n: seen, total: words.length });
      var tdM = document.createElement("td");
      tdM.textContent = num(m);
      row.append(th, tdSeen, tdM);
      el.statsLevels.appendChild(row);
    });
    setText(el.statsMastered, num(mastered));
    setText(el.statsAnswered, num(state.answered));
    renderMissed();
  }

  // Words missed most often, then those sitting lowest in the box. Box 1
  // counts as missed even without a miss count: only a wrong answer puts a
  // word there, and saves from before the count existed have none.
  function mostMissed() {
    return WORDS.filter(function (w) {
      var p = state.prog[w.w];
      return p && ((p.m || 0) > 0 || p.b === 1);
    }).sort(function (x, y) {
      var px = state.prog[x.w];
      var py = state.prog[y.w];
      return (py.m || 0) - (px.m || 0) || px.b - py.b;
    }).slice(0, MISSED_SHOWN);
  }

  function renderMissed() {
    var list = mostMissed();
    el.statsMissed.textContent = "";
    el.statsMissed.hidden = !list.length;
    el.statsMissedEmpty.hidden = list.length > 0;
    list.forEach(function (w) {
      var p = state.prog[w.w];
      var li = document.createElement("li");

      var noun = document.createElement("span");
      noun.className = "missed-noun";
      noun.lang = "de";
      noun.dir = "ltr";
      noun.append(artNode(w.a), " " + w.w);

      var meaning = document.createElement("span");
      meaning.className = "missed-meaning";
      var fa = state.lang === "fa";
      meaning.lang = fa ? "fa" : "en";
      meaning.textContent = fa ? w.fa : w.en;

      var detail = document.createElement("span");
      detail.className = "missed-detail";
      var m = p.m || 0;
      detail.textContent = (m ? fmt(m === 1 ? "missOne" : "misses", { m: m }) + t("listSep") : "") + fmt("inBox", { b: p.b });

      li.append(noun, meaning, detail);
      el.statsMissed.appendChild(li);
    });
  }

  // ---------------------------------------------------------------- speech

  // Reads "der Gast" aloud after each answer. Browsers without the Web Speech
  // API or without a German voice skip it, and the toggle stays hidden.
  var speech = window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null;
  var germanVoice = null;

  function findVoice() {
    var voices = [];
    try {
      voices = speech.getVoices() || [];
    } catch (e) {
      voices = [];
    }
    germanVoice = null;
    for (var i = 0; i < voices.length; i++) {
      var lang = String(voices[i].lang || "").replace("_", "-");
      if (!/^de(-|$)/i.test(lang)) continue;
      // Prefer de-DE over Austrian or Swiss voices, and local voices
      // over network ones.
      var better = !germanVoice ||
        (lang === "de-DE" && germanVoice.lang !== "de-DE") ||
        (lang === germanVoice.lang && voices[i].localService && !germanVoice.localService);
      if (better) germanVoice = voices[i];
    }
    el.sound.hidden = !germanVoice;
  }

  function say(text) {
    if (!speech || !germanVoice || !state.sound) return;
    try {
      speech.cancel();
      var u = new window.SpeechSynthesisUtterance(text);
      u.voice = germanVoice;
      u.lang = germanVoice.lang;
      u.rate = 0.9;
      speech.speak(u);
    } catch (e) {
      // Some browsers throw when speech is blocked. Silence is fine.
    }
  }

  function renderSound() {
    el.sound.setAttribute("aria-pressed", state.sound ? "true" : "false");
  }

  function toggleSound() {
    state.sound = !state.sound;
    save();
    renderSound();
    if (!state.sound && speech) speech.cancel();
  }

  // ---------------------------------------------------------------- actions

  function answer(article) {
    if (hasAnswered || !current) return;
    hasAnswered = true;
    var ok = article === current.a;

    state.turn++;
    state.answered++;
    state.stats[current.a].n++;
    var isNew = !state.prog[current.w];
    var p = state.prog[current.w] || { b: 1, n: 0 };
    var wasBox = isNew ? 0 : p.b;
    var goalMet = countCard();
    if (ok) {
      state.correct++;
      state.stats[current.a].ok++;
      state.streak++;
      if (state.streak > state.best) state.best = state.streak;
      // Known on first sight: skip ahead to box 3. It still has to come
      // back right twice before it counts as mastered.
      p.b = isNew ? FIRST_TRY_BOX : Math.min(BOXES, p.b + 1);
    } else {
      state.streak = 0;
      p.b = 1;
      p.m = (p.m || 0) + 1;
    }
    p.n = state.turn + GAP[p.b];
    state.prog[current.w] = p;
    save();

    // Fill the blank.
    el.slot.textContent = current.a;
    el.slot.setAttribute("data-article", current.a);
    el.slot.removeAttribute("aria-label");
    el.card.setAttribute("data-article", current.a);
    el.card.setAttribute("data-result", ok ? "right" : "wrong");
    el.card.classList.add("is-answered");

    el.choices.forEach(function (btn) {
      var a = btn.getAttribute("data-article");
      btn.disabled = true;
      if (a === current.a) btn.classList.add("is-correct");
      if (a === article && !ok) btn.classList.add("is-wrong");
    });

    var mastered = p.b === BOXES && wasBox < BOXES;
    last = { chosen: article, ok: ok, box: p.b, mastered: mastered };
    renderFeedback(true);
    el.feedback.hidden = false;
    renderScore();
    renderDaily();
    renderBox(p.b);
    if (mastered) celebrate();

    var meaning = state.lang === "fa" ? current.fa : current.en;
    el.live.textContent = t(ok ? "liveRight" : "liveWrong") + " " + current.a + " " + current.w + ". " + meaning +
      (mastered ? " " + t("liveMastered") : "") + (goalMet ? " " + t("liveGoal") : "");
    say(current.a + " " + current.w);
    el.next.focus({ preventScroll: true });
  }

  // Verdict, plural, box line and meaning for the last answer. fresh is
  // false when only the language changed, so the badge stays still.
  function renderFeedback(fresh) {
    if (!current || !last) return;
    var fa = state.lang === "fa";

    el.verdict.textContent = "";
    if (last.ok) {
      el.verdict.textContent = t("right");
      el.verdict.lang = fa ? "fa" : "de";
    } else {
      var chosen = document.createElement("span");
      chosen.lang = "de";
      chosen.dir = "ltr";
      chosen.textContent = last.chosen;
      var strong = document.createElement("b");
      strong.lang = "de";
      strong.dir = "ltr";
      strong.textContent = current.a + " " + current.w;
      el.verdict.append.apply(el.verdict, parts("wrong", { chosen: chosen, answer: strong }));
      el.verdict.lang = fa ? "fa" : "en";
    }
    if (last.mastered) el.verdict.append(" ", masteredBadge(fresh));

    if (current.pl === NO_PLURAL) {
      el.plural.textContent = t("noPlural");
    } else {
      el.plural.textContent = "";
      var pl = document.createElement("span");
      pl.lang = "de";
      pl.dir = "ltr";
      pl.textContent = "die " + current.pl;
      el.plural.append.apply(el.plural, parts("plural", { pl: pl }));
    }

    renderWordBox();
    renderMeaning();
  }

  function masteredBadge(fresh) {
    var badge = document.createElement("span");
    badge.className = "mastered" + (fresh ? "" : " is-still");
    badge.textContent = t("mastered");
    if (fresh) {
      var burst = document.createElement("span");
      burst.className = "burst";
      burst.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 6; i++) burst.appendChild(document.createElement("i"));
      badge.appendChild(burst);
    }
    return badge;
  }

  function celebrate() {
    var cell = el.boxCells[BOXES];
    if (!cell) return;
    cell.classList.remove("is-celebrating");
    // Force a reflow so the animation restarts when two words in a row
    // reach the top box.
    void cell.offsetWidth;
    cell.classList.add("is-celebrating");
  }

  function nextWord() {
    hasAnswered = false;
    last = null;
    el.card.removeAttribute("data-result");
    current = pickNext();
    renderWord();
    if (document.activeElement === el.next || document.activeElement === document.body) {
      el.noun.focus({ preventScroll: true });
    }
  }

  function setLevel(level) {
    if (LEVELS.indexOf(level) === -1 || level === state.level) return;
    state.level = level;
    save();
    current = null;
    nextWord();
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    state.lang = lang;
    save();
    applyLang();
    renderScore();
    renderDaily();
    renderBox(hasAnswered && last ? last.box : boxOf(current));
    if (!current) {
      setText(el.noun, t("noWords"));
    } else if (hasAnswered) {
      renderFeedback(false);
    } else {
      renderWordBox();
      el.slot.setAttribute("aria-label", t("missingArticle"));
    }
  }

  // Static text in index.html carries data-i18n (text), data-i18n-label
  // (aria-label and title) or data-num (a number to localise).
  function applyLang() {
    var fa = state.lang === "fa";
    var root = document.documentElement;
    root.lang = fa ? "fa" : "en";
    root.dir = fa ? "rtl" : "ltr";
    root.setAttribute("data-lang", state.lang);
    document.title = t("title");
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-label]"), function (node) {
      var text = t(node.getAttribute("data-i18n-label"));
      node.setAttribute("aria-label", text);
      if (node.hasAttribute("title")) node.title = text;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-num]"), function (node) {
      node.textContent = num(node.getAttribute("data-num"));
    });
    if (!el.reset.classList.contains("is-armed")) el.reset.textContent = t("reset");
  }

  var resetTimer = null;
  function resetProgress() {
    if (!el.reset.classList.contains("is-armed")) {
      el.reset.classList.add("is-armed");
      el.reset.textContent = t("resetArmed");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(disarmReset, 4000);
      return;
    }
    disarmReset();
    var keep = { level: state.level, lang: state.lang, sound: state.sound, goal: state.goal };
    state = defaults();
    state.level = keep.level;
    state.lang = keep.lang;
    state.sound = keep.sound;
    state.goal = keep.goal;
    save();
    renderScore();
    renderDaily();
    renderStats();
    current = null;
    nextWord();
    el.live.textContent = t("erased");
  }

  function disarmReset() {
    clearTimeout(resetTimer);
    el.reset.classList.remove("is-armed");
    el.reset.textContent = t("reset");
  }

  function openStats() {
    renderStats();
    if (typeof el.statsDialog.showModal === "function") {
      el.statsDialog.showModal();
    } else {
      el.statsDialog.setAttribute("open", "");
    }
  }

  function closeStats() {
    disarmReset();
    if (typeof el.statsDialog.close === "function") {
      el.statsDialog.close();
    } else {
      el.statsDialog.removeAttribute("open");
    }
  }

  // ---------------------------------------------------------------- wiring

  el.choices.forEach(function (btn) {
    btn.addEventListener("click", function () {
      answer(btn.getAttribute("data-article"));
    });
  });
  el.next.addEventListener("click", nextWord);

  el.levelInputs.forEach(function (input) {
    input.checked = input.value === state.level;
    input.addEventListener("change", function () {
      if (input.checked) setLevel(input.value);
    });
  });
  el.langInputs.forEach(function (input) {
    input.checked = input.value === state.lang;
    input.addEventListener("change", function () {
      if (input.checked) setLang(input.value);
    });
  });

  el.goalInputs.forEach(function (input) {
    input.checked = Number(input.value) === state.goal;
    input.addEventListener("change", function () {
      if (input.checked) setGoal(Number(input.value));
    });
  });

  el.statsOpen.addEventListener("click", openStats);
  el.statsClose.addEventListener("click", closeStats);
  el.statsDialog.addEventListener("close", disarmReset);
  el.statsDialog.addEventListener("click", function (e) {
    // Click on the backdrop closes the dialog.
    if (e.target === el.statsDialog) closeStats();
  });
  el.reset.addEventListener("click", resetProgress);
  el.sound.addEventListener("click", toggleSound);

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (el.statsDialog.open) return;
    var tag = e.target && e.target.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT" || (tag === "INPUT" && e.target.type === "text")) return;

    var index = Object.prototype.hasOwnProperty.call(ANSWER_KEYS, e.code)
      ? ANSWER_KEYS[e.code]
      : ["1", "2", "3"].indexOf(e.key);
    if (index !== -1 && !hasAnswered) {
      e.preventDefault();
      answer(ARTICLES[index]);
      return;
    }
    // On a focused button, Enter and Space already click it.
    var isNextKey = e.key === "Enter" || e.key === " " || e.code === "Space";
    if (hasAnswered && isNextKey && tag !== "BUTTON" && tag !== "A" && tag !== "INPUT") {
      e.preventDefault();
      nextWord();
    }
  });

  // ---------------------------------------------------------------- start

  applyLang();
  renderSound();
  renderDaily();
  if (speech) {
    findVoice();
    // Chrome and Edge load the voice list after the page.
    if (typeof speech.addEventListener === "function") {
      speech.addEventListener("voiceschanged", findVoice);
    } else {
      speech.onvoiceschanged = findVoice;
    }
  }
  renderScore();
  nextWord();

  // Offline support. Service workers need http(s); opened from disk, the
  // page simply runs without one.
  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
