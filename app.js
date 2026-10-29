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
  var DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

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
      setText(el.noun, "No words for this level");
      setText(el.slot, "");
      el.choices.forEach(function (b) { b.disabled = true; });
      return;
    }
    el.card.removeAttribute("data-article");
    el.card.style.setProperty("--len", String(current.w.length));
    el.slot.textContent = "";
    el.slot.removeAttribute("data-article");
    el.slot.setAttribute("aria-label", "missing article");
    el.noun.textContent = current.w;
    setText(el.wordLevel, current.lvl);
    var b = boxOf(current);
    setText(el.wordBox, b ? "Box " + b + " of " + BOXES : "New word");

    el.choices.forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove("is-correct", "is-wrong");
      btn.removeAttribute("aria-describedby");
    });
    el.feedback.hidden = true;
    el.card.classList.remove("is-answered");
    renderBox(b);
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
    var or = fa ? " یا " : " or ";
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
    setText(el.statCorrect, state.correct + " / " + state.answered);
    setText(el.statStreak, String(state.streak));
    setText(el.statBest, String(state.best));
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
      setText(countNode, String(counts[i]));
      cell.classList.toggle("is-active", i === activeBox);
      var label = (i === 0 ? "New" : "Box " + i) + ": " + counts[i] + (counts[i] === 1 ? " word" : " words");
      if (i === activeBox) label += ", current word";
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
    setText(el.dailyCount, n + " / " + state.goal);
    el.dailyFill.style.width = Math.min(100, (n / state.goal) * 100) + "%";
    el.dailyMeter.setAttribute("aria-valuemax", String(state.goal));
    el.dailyMeter.setAttribute("aria-valuenow", String(Math.min(n, state.goal)));
    el.daily.classList.toggle("is-done", done);
    var days = dayStreak();
    setText(el.dailyDays, String(days));
    setText(el.dailyDaysLabel, days === 1 ? "day in a row" : "days in a row");
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
      bar.setAttribute("aria-label", a + ": " + (st.n ? p + "% correct" : "not asked yet"));
      var fill = document.createElement("span");
      fill.className = "meter-fill";
      fill.style.width = p + "%";
      bar.appendChild(fill);

      var value = document.createElement("span");
      value.className = "meter-value";
      value.textContent = st.n ? p + "%" : "–";
      var detail = document.createElement("span");
      detail.className = "meter-detail";
      detail.textContent = st.n ? st.ok + " of " + st.n : "no answers yet";

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
      tdSeen.textContent = seen + " / " + words.length;
      var tdM = document.createElement("td");
      tdM.textContent = String(m);
      row.append(th, tdSeen, tdM);
      el.statsLevels.appendChild(row);
    });
    setText(el.statsMastered, String(mastered));
    setText(el.statsAnswered, String(state.answered));
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

    el.verdict.textContent = "";
    if (ok) {
      el.verdict.textContent = "Richtig.";
    } else {
      var strong = document.createElement("b");
      strong.lang = "de";
      strong.textContent = current.a + " " + current.w;
      el.verdict.append("Not ", article, ". It is ", strong, ".");
    }
    el.verdict.lang = ok ? "de" : "en";

    var mastered = p.b === BOXES && wasBox < BOXES;
    if (mastered) el.verdict.append(" ", masteredBadge());

    if (current.pl === NO_PLURAL) {
      el.plural.textContent = "No plural";
    } else {
      el.plural.textContent = "";
      var pl = document.createElement("span");
      pl.lang = "de";
      pl.textContent = "die " + current.pl;
      el.plural.append("Plural: ", pl);
    }

    setText(el.wordBox, "Now in box " + p.b + " of " + BOXES);
    renderMeaning();
    el.feedback.hidden = false;
    renderScore();
    renderDaily();
    renderBox(p.b);
    if (mastered) celebrate();

    var meaning = state.lang === "fa" ? current.fa : current.en;
    el.live.textContent = (ok ? "Correct. " : "Wrong. ") + current.a + " " + current.w + ". " + meaning +
      (mastered ? " Mastered." : "") + (goalMet ? " Daily goal reached." : "");
    say(current.a + " " + current.w);
    el.next.focus({ preventScroll: true });
  }

  function masteredBadge() {
    var badge = document.createElement("span");
    badge.className = "mastered";
    badge.lang = "en";
    badge.textContent = "Mastered";
    var burst = document.createElement("span");
    burst.className = "burst";
    burst.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 6; i++) burst.appendChild(document.createElement("i"));
    badge.appendChild(burst);
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
    document.documentElement.setAttribute("data-lang", lang);
    save();
    if (hasAnswered) renderMeaning();
  }

  var resetTimer = null;
  function resetProgress() {
    if (!el.reset.classList.contains("is-armed")) {
      el.reset.classList.add("is-armed");
      el.reset.textContent = "Tap again to erase all progress";
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
    el.live.textContent = "Progress erased.";
  }

  function disarmReset() {
    clearTimeout(resetTimer);
    el.reset.classList.remove("is-armed");
    el.reset.textContent = "Reset progress";
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

    var index = ["1", "2", "3"].indexOf(e.key);
    if (index !== -1 && !hasAnswered) {
      e.preventDefault();
      answer(ARTICLES[index]);
      return;
    }
    if (hasAnswered && e.key === "Enter" && tag !== "BUTTON" && tag !== "A" && tag !== "INPUT") {
      e.preventDefault();
      nextWord();
    }
  });

  // ---------------------------------------------------------------- start

  document.documentElement.setAttribute("data-lang", state.lang);
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
})();
