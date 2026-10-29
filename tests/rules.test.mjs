// Measures every hint rule in rules.js against the nouns in words.js.
// Run with: node tests/rules.test.mjs   (exits 1 if a check fails)
//
// A rule's hint text promises a share of nouns ("Most nouns ending in -e
// take die"). This test fails when the word list no longer backs that up.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const file of ["words.js", "rules.js"]) {
  vm.runInContext(readFileSync(join(root, file), "utf8"), sandbox, { filename: file });
}
const words = sandbox.WORDS;
const RULES = sandbox.RULES;

let failures = 0;
function check(ok, message) {
  if (ok) {
    console.log("ok   " + message);
  } else {
    failures++;
    console.log("FAIL " + message);
  }
}

const pct = (x) => (x * 100).toFixed(0) + "%";

for (const rule of RULES.LIST) {
  const name = rule.prefix ? rule.prefix + "-" : "-" + rule.suffix;
  const claimed = RULES.MIN[rule.hedge || "sure"];
  const covered = words.filter((w) => RULES.firstMatch(w.w) === rule);
  const misses = covered.filter((w) => !RULES.fits(rule, w.a));
  const share = covered.length ? (covered.length - misses.length) / covered.length : 1;
  const label = `${name} -> ${RULES.articles(rule).join("/")}: ${covered.length - misses.length}/${covered.length} = ${pct(share)}, claims >= ${pct(claimed)}`;
  check(share >= claimed, label + (misses.length ? `  (exceptions: ${misses.map((w) => w.a + " " + w.w).join(", ")})` : ""));
}

const timeWords = words.filter((w) => RULES.TIME_WORDS.includes(w.w));
const timeMisses = timeWords.filter((w) => w.a !== "der");
check(timeMisses.length === 0, `days, months, seasons -> der: ${timeWords.length - timeMisses.length}/${timeWords.length}`);

// ruleFor() must never offer a rule the noun breaks.
const wrongHints = words.filter((w) => {
  const r = RULES.ruleFor(w);
  return r && !(r.time ? w.a === "der" : RULES.fits(r, w.a));
});
check(wrongHints.length === 0, "no hint contradicts its noun" + (wrongHints.length ? `: ${wrongHints.map((w) => w.w).join(", ")}` : ""));

// Regression: das Museum used to get no hint because -um needed a consonant.
for (const noun of ["Museum", "Studium", "Datum"]) {
  const w = words.find((x) => x.w === noun);
  const r = w && RULES.ruleFor(w);
  check(!!r && r.suffix === "um", `das ${noun} gets the -um hint`);
}
// One-syllable words and look-alikes stay outside the suffix they resemble.
for (const [noun, suffix] of [["Tanz", "anz"], ["Knie", "ie"], ["Streik", "ik"], ["Kuchen", "chen"], ["Baum", "um"]]) {
  const r = RULES.firstMatch(noun);
  check(!r || r.suffix !== suffix, `${noun} is not counted under -${suffix}`);
}

const hinted = words.filter((w) => RULES.ruleFor(w)).length;
console.log(`\n${hinted} of ${words.length} nouns get a rule hint`);

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
