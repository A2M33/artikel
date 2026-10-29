/*
 * Gender rules for artikel's hints.
 *
 * Plain script like words.js: defines window.RULES so app.js can use it and
 * tests/rules.test.mjs can measure it against the word list.
 *
 * Each rule says how sure it is:
 *   (none)      at least 90% of the matching nouns in words.js follow it
 *   "usually"   at least 80%
 *   "often"     at least 50%
 * The test fails if a rule drops below what its hint text claims.
 *
 * Order matters. A noun belongs to the first rule whose pattern it matches,
 * and the accuracy test counts it there. When that rule does not fit the
 * noun (die Geschichte starts with Ge-), ruleFor() keeps looking, so the
 * hint the player sees is always one this noun follows.
 */
(function (root) {
  "use strict";

  var MIN = { sure: 0.9, usually: 0.8, often: 0.5 };

  var TIME_WORDS = [
    "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag",
    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August",
    "September", "Oktober", "November", "Dezember",
    "Frühling", "Sommer", "Herbst", "Winter"
  ];

  // "V.*" in front of a suffix means the noun has a vowel before it, so it
  // has more than one syllable. That keeps der Tanz, das Knie and der Streik
  // out of rules meant for -anz, -ie and -ik loanwords.
  var LIST = [
    { a: "die", suffix: "ung", re: /ung$/ },
    { a: "die", suffix: "heit", re: /heit$/ },
    { a: "die", suffix: "keit", re: /keit$/ },
    { a: "die", suffix: "schaft", re: /schaft$/ },
    { a: "die", suffix: "tät", re: /tät$/ },
    { a: "die", suffix: "ion", re: /ion$/ },
    { a: "die", suffix: "ie", re: /[aeiouäöü].*[^aeiouäöü]ie$/ },
    { a: "die", suffix: "ei", re: /[aeiouäöü].*[^aeiouäöü]ei$/ },
    { a: "die", suffix: "ik", re: /[aeiouäöü].*[^aeiouäöü]ik$/ },
    { a: "der", suffix: "eur", re: /eur$/ },
    { a: "die", suffix: "ur", re: /[aeiouäöü].*[^aeiouäöü]ur$/ },
    { a: "die", suffix: "enz", re: /enz$/ },
    { a: "die", suffix: "anz", re: /[aeiouäöü].*anz$/ },
    { a: ["die", "das"], suffix: "nis", re: /nis$/ },
    // Diminutives. A consonant before -chen leaves out der Kuchen.
    { a: "das", suffix: "chen", re: /[^aeiouäöü]chen$/ },
    { a: "das", suffix: "lein", re: /lein$/ },
    { a: "das", suffix: "ment", re: /ment$/ },
    // -um after a consonant, -eum or -ium: das Datum, das Museum, das Studium.
    // Leaves out der Baum, der Raum and der Traum.
    { a: "das", suffix: "um", re: /(?:[^aeiouäöü]|[ei])um$/ },
    { a: "der", suffix: "ling", re: /ling$/ },
    { a: "der", suffix: "ismus", re: /ismus$/ },
    { a: "das", prefix: "Ge", re: /^Ge/, hedge: "often" },
    { a: "die", suffix: "e", re: /e$/, hedge: "usually" }
  ];

  function articles(rule) {
    return typeof rule.a === "string" ? [rule.a] : rule.a;
  }

  function fits(rule, article) {
    return articles(rule).indexOf(article) !== -1;
  }

  // The first rule in LIST whose pattern matches, or null. This is the rule
  // a noun counts towards in the accuracy test.
  function firstMatch(noun) {
    for (var i = 0; i < LIST.length; i++) {
      if (LIST[i].re.test(noun)) return LIST[i];
    }
    return null;
  }

  // Returns the rule that explains this word, or null. A rule is only shown
  // when the word actually follows it, so exceptions (der Gedanke, das
  // Stadion) never get a misleading hint.
  function ruleFor(word) {
    if (TIME_WORDS.indexOf(word.w) !== -1) {
      return word.a === "der" ? { a: "der", time: true } : null;
    }
    for (var i = 0; i < LIST.length; i++) {
      var r = LIST[i];
      if (r.re.test(word.w) && fits(r, word.a)) return r;
    }
    return null;
  }

  root.RULES = {
    MIN: MIN,
    TIME_WORDS: TIME_WORDS,
    LIST: LIST,
    articles: articles,
    fits: fits,
    firstMatch: firstMatch,
    ruleFor: ruleFor
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
