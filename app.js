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

  // ---------------------------------------------------------------- rules

  var TIME_WORDS = [
    "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag",
    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August",
    "September", "Oktober", "November", "Dezember",
    "Frühling", "Sommer", "Herbst", "Winter"
  ];

  var SUFFIX_RULES = [
    { a: "die", suffix: "ung", re: /ung$/ },
    { a: "die", suffix: "heit", re: /heit$/ },
    { a: "die", suffix: "keit", re: /keit$/ },
    { a: "die", suffix: "schaft", re: /schaft$/ },
    { a: "die", suffix: "tät", re: /tät$/ },
    { a: "die", suffix: "ion", re: /ion$/ },
    { a: "das", suffix: "chen", re: /chen$/ },
    { a: "das", suffix: "lein", re: /lein$/ },
    { a: "das", suffix: "ment", re: /ment$/ },
    { a: "das", suffix: "um", re: /[^aeiouäöü]um$/ },
    { a: "der", suffix: "ling", re: /ling$/ },
    { a: "der", suffix: "ismus", re: /ismus$/ }
  ];

  // Returns the rule that explains this word, or null. A rule is only shown
  // when the word actually follows it, so exceptions (der Kuchen, das Stadion)
  // never get a misleading hint.
  function ruleFor(word) {
    if (TIME_WORDS.indexOf(word.w) !== -1) {
      return word.a === "der" ? { a: "der", time: true } : null;
    }
    for (var i = 0; i < SUFFIX_RULES.length; i++) {
      var r = SUFFIX_RULES[i];
      if (r.re.test(word.w)) return r.a === word.a ? r : null;
    }
    return null;
  }

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
      lang: "en"
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

    ["turn", "answered", "correct", "streak", "best"].forEach(function (k) {
      if (isCount(data[k])) s[k] = Math.floor(data[k]);
    });
    if (LEVELS.indexOf(data.level) !== -1) s.level = data.level;
    if (LANGS.indexOf(data.lang) !== -1) s.lang = data.lang;
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
    el.hint.setAttribute("data-article", rule.a);

    var art = document.createElement("b");
    art.lang = "de";
    art.dir = "ltr";
    art.className = "art art-" + rule.a;
    art.textContent = rule.a;

    if (rule.time) {
      if (fa) {
        el.hint.append("نام روزها، ماه‌ها و فصل‌ها با ", art, " می‌آیند.");
      } else {
        el.hint.append("Days, months and seasons take ", art, ".");
      }
    } else {
      var suf = document.createElement("span");
      suf.lang = "de";
      suf.dir = "ltr";
      suf.className = "suffix";
      suf.textContent = "-" + rule.suffix;
      if (fa) {
        el.hint.append("اسم‌هایی که به ", suf, " ختم می‌شوند با ", art, " می‌آیند.");
      } else {
        el.hint.append("Nouns ending in ", suf, " take ", art, ".");
      }
    }
    el.hint.hidden = false;
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
    renderBox(p.b);

    var meaning = state.lang === "fa" ? current.fa : current.en;
    el.live.textContent = (ok ? "Correct. " : "Wrong. ") + current.a + " " + current.w + ". " + meaning;
    el.next.focus({ preventScroll: true });
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
    var keep = { level: state.level, lang: state.lang };
    state = defaults();
    state.level = keep.level;
    state.lang = keep.lang;
    save();
    renderScore();
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

  el.statsOpen.addEventListener("click", openStats);
  el.statsClose.addEventListener("click", closeStats);
  el.statsDialog.addEventListener("close", disarmReset);
  el.statsDialog.addEventListener("click", function (e) {
    // Click on the backdrop closes the dialog.
    if (e.target === el.statsDialog) closeStats();
  });
  el.reset.addEventListener("click", resetProgress);

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
  renderScore();
  nextWord();
})();
