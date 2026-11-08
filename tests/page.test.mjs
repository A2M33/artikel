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
check(["192x192", "512x512"].every((size) => (manifest.icons || []).some((i) => i.sizes === size && i.src.endsWith(".png"))),
  "manifest lists 192 and 512 PNG icons");

// The fonts come from style sheets, not the page, so list them separately.
const fontFiles = [...(readFileSync(join(root, "tokens.css"), "utf8") + css).matchAll(/url\("([^"]+\.woff2)"\)/g)].map((m) => m[1]);
const uncachedFonts = fontFiles.filter((f) => !cached.includes(f));
check(fontFiles.length > 0 && uncachedFonts.length === 0, "sw.js caches every font" + (uncachedFonts.length ? `: ${uncachedFonts.join(", ")}` : ""));

// Bug: the noun's type scales with its length, so der/die/das sat up to 38px
// higher or lower from one card to the next.
check(/\.phrase\s*\{[^}]*min-height\s*:/.test(css), ".phrase reserves its height");

// Bug: 75% opacity took the 12px key numbers on the buttons down to 3:1.
check(!/\.choice-key\s*\{[^}]*opacity/.test(css), ".choice-key keeps full contrast");

// Bug: only elements with their own lang="fa" got the Persian font stack; the
// interface text inherited body's Latin one.
check(/\[lang="fa"\]\s+body\b[^{]*\{[^}]*var\(--fa\)/.test(css), "Persian mode applies --fa to body");

// Bug: the tapped answer button stayed filled on the next card on touch screens.
const hoverRule = css.indexOf(".choice:hover");
check(hoverRule > css.lastIndexOf("@media (hover: hover)", hoverRule) && css.lastIndexOf("@media (hover: hover)", hoverRule) !== -1,
  ".choice hover colours apply to hover devices only");

// Bug: the install step could copy a stale file from the HTTP cache.
check(/cache:\s*"reload"/.test(sw), "sw.js fetches past the HTTP cache on install");

// Bug: the button stopped 6px below the fold on a 320x568 phone, because the
// scroll ran while the panel's rise-in animation still offset it.
check(/\.next\s*\{[^}]*scroll-margin-block-end/.test(css), ".next keeps a scroll margin");

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
