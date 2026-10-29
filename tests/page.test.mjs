// Static checks on index.html and style.css for layout bugs that once
// shipped. Run with: node tests/page.test.mjs   (exits 1 if a check fails)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "style.css"), "utf8");

let failures = 0;
function check(ok, message) {
  if (ok) {
    console.log("ok   " + message);
  } else {
    failures++;
    console.log("FAIL " + message);
  }
}

// Bug: ".feedback { display: grid }" beat the hidden attribute, so the Next
// button showed before an answer and skipped the card without counting it.
check(
  /\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/.test(css),
  "style.css forces display:none on [hidden]"
);
check(/id="feedback"[^>]*\shidden[\s>]/.test(html), "#feedback starts hidden");

// Bug: the feedback opened inside the card, above the buttons, and pushed
// der/die/das down by about 100px on phones right after an answer.
const choicesAt = html.indexOf('class="choices"');
const feedbackAt = html.indexOf('id="feedback"');
const cardEnd = html.indexOf("</section>", html.indexOf('id="card"'));
check(choicesAt !== -1 && feedbackAt > choicesAt, "#feedback comes after the answer buttons");
check(cardEnd !== -1 && feedbackAt > cardEnd, "#feedback sits outside the card");

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
