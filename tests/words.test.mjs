// Checks the word list in words.js.
// Run with: node tests/words.test.mjs   (exits 1 on the first failed check)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "words.js"), "utf8");

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "words.js" });
const words = sandbox.WORDS;

// Nouns with two genders, a meaning that changes with the article, or no
// normal singular. None of these may appear in the list.
const EXCLUDED = [
  // named in the project spec
  "See", "Teil", "Band", "Leiter", "Gehalt", "Joghurt", "Bonbon",
  // two genders or gender-dependent meaning
  "Kiefer", "Tor", "Steuer", "Moment", "Erbe", "Schild", "Mangel", "Bauer",
  "Kunde", "Heide", "Hut", "Mark", "Laster", "Weise", "Golf", "Junge",
  "Kiwi", "Single", "Virus", "Cola", "Ketchup", "Liter", "Meter", "Keks",
  "Gummi", "Kaugummi", "Sakko", "Spray", "Filter", "Puder", "Pyjama",
  "Tunnel", "Prospekt", "Dschungel", "Messer", "Stift", "Flur", "Reis",
  "Morgen", "Zeh", "Paprika", "Sandwich", "Poster", "Blog", "Event",
  "E-Mail", "Bund", "Tau", "Kristall", "Verdienst", "Taube", "Lama",
  "Otter", "Marsch", "Pack", "Ekel", "Harz", "Wehr", "Gefallen", "Mast",
  "Halfter", "Dotter", "Curry",
  // plural-only or nearly always plural
  "Eltern", "Leute", "Ferien", "Geschwister", "Kosten", "Möbel", "Pommes",
  "Jeans", "Shorts", "Nebenkosten", "Lebensmittel", "Unterlagen", "Medien",
  "Weihnachten", "Ostern", "Pfingsten",
];

const ARTICLES = new Set(["der", "die", "das"]);
const LEVELS = new Set(["A1", "A2", "B1"]);
const FIELDS = ["w", "a", "pl", "en", "fa", "lvl"];

let failures = 0;
function check(ok, message) {
  if (ok) {
    console.log("ok   " + message);
  } else {
    failures++;
    console.log("FAIL " + message);
  }
}

check(Array.isArray(words), "words.js defines a WORDS array");
if (!Array.isArray(words)) process.exit(1);

check(words.length >= 600, `at least 600 entries (found ${words.length})`);

const seen = new Map();
const dupes = [];
for (const entry of words) {
  if (seen.has(entry.w)) dupes.push(entry.w);
  seen.set(entry.w, entry);
}
check(dupes.length === 0, "every noun appears once" + (dupes.length ? `: ${dupes.join(", ")}` : ""));

const badArticle = words.filter((e) => !ARTICLES.has(e.a)).map((e) => `${e.w}=${e.a}`);
check(badArticle.length === 0, "article is der, die or das" + (badArticle.length ? `: ${badArticle.join(", ")}` : ""));

const empty = [];
for (const entry of words) {
  for (const key of FIELDS) {
    const value = entry[key];
    if (typeof value !== "string" || value.trim() === "") empty.push(`${entry.w || "?"}.${key}`);
  }
}
check(empty.length === 0, "no empty fields" + (empty.length ? `: ${empty.slice(0, 20).join(", ")}` : ""));

const badLevel = words.filter((e) => !LEVELS.has(e.lvl)).map((e) => `${e.w}=${e.lvl}`);
check(badLevel.length === 0, "level is A1, A2 or B1" + (badLevel.length ? `: ${badLevel.join(", ")}` : ""));

const banned = EXCLUDED.filter((w) => seen.has(w));
check(banned.length === 0, "no excluded ambiguous or plural-only nouns" + (banned.length ? `: ${banned.join(", ")}` : ""));

// Light sanity checks on the text itself.
const notCapitalised = words.filter((e) => !/^[A-ZÄÖÜ]/.test(e.w)).map((e) => e.w);
check(notCapitalised.length === 0, "nouns start with a capital letter" + (notCapitalised.length ? `: ${notCapitalised.join(", ")}` : ""));

const pluralWithArticle = words.filter((e) => /^(der|die|das|den|dem)\s/i.test(e.pl)).map((e) => e.w);
check(pluralWithArticle.length === 0, "plurals are written without an article" + (pluralWithArticle.length ? `: ${pluralWithArticle.join(", ")}` : ""));

const notPersian = words.filter((e) => !/[؀-ۿ]/.test(e.fa)).map((e) => e.w);
check(notPersian.length === 0, "Persian meanings use Persian script" + (notPersian.length ? `: ${notPersian.join(", ")}` : ""));

const perLevel = {};
for (const e of words) perLevel[e.lvl] = (perLevel[e.lvl] || 0) + 1;
const perArticle = {};
for (const e of words) perArticle[e.a] = (perArticle[e.a] || 0) + 1;
console.log("\nlevels:  ", perLevel);
console.log("articles:", perArticle);

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
