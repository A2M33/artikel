// Static checks on index.html and style.css for layout bugs that once
// shipped. Run with: node tests/page.test.mjs   (exits 1 if a check fails)
import { readFileSync, existsSync } from "node:fs";
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

// Offline support: the service worker must cache every file the page loads,
// and every file it lists must exist, or install fails and nothing caches.
const sw = readFileSync(join(root, "sw.js"), "utf8");
const listMatch = /var FILES = \[([\s\S]*?)\];/.exec(sw);
const cached = listMatch ? [...listMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
check(cached.length > 0, "sw.js has a FILES list");
const missingFiles = cached.filter((f) => f !== "./" && !existsSync(join(root, f)));
check(missingFiles.length === 0, "every cached file exists" + (missingFiles.length ? `: ${missingFiles.join(", ")}` : ""));
const referenced = [...html.matchAll(/\s(?:href|src)="([^"#:]+)"/g)].map((m) => m[1]);
const manifest = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
const icons = (manifest.icons || []).map((i) => i.src);
const uncached = [...referenced, ...icons].filter((f) => !cached.includes(f));
check(uncached.length === 0, "sw.js caches every file the page and manifest use" + (uncached.length ? `: ${uncached.join(", ")}` : ""));
check(icons.some((s) => s.endsWith(".png")) && icons.some((s) => s.endsWith(".svg")), "manifest lists a PNG and an SVG icon");

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
