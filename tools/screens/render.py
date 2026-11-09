"""Render the README screenshots from the real app with Playwright and Microsoft Edge.

The page opens from disk in a headless browser with a seeded save: the A1
level, ten cards done today on a goal of ten, and der Bus due in box 1. The
script answers "die" so the card shows a wrong pick and its verdict.

    docs/desktop-light.png, docs/desktop-dark.png   1280 px wide, full page
    docs/phone-light.png, docs/phone-dark.png       390 px wide at 2x, full page
    tools/banner/app.png                            dark desktop at 2x, for the banner

    pip install playwright
    python tools/screens/render.py
"""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"

# Runs before app.js: a fixed save, no speech (the voice button stays hidden)
# and Math.random() = 0, so the due word der Bus comes up first.
SEED = """
(() => {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  const today = d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  const prog = %s;
  localStorage.setItem("artikel.progress.v1", JSON.stringify({
    v: 1, turn: 10, prog, answered: 10, correct: 3, streak: 1, best: 2,
    stats: { der: { n: 4, ok: 1 }, die: { n: 3, ok: 1 }, das: { n: 3, ok: 1 } },
    level: "A1", lang: "en", sound: true, goal: 10,
    today: { d: today, n: 10 }, days: 1, goalDay: today
  }));
  Math.random = () => 0;
  try { delete window.speechSynthesis; } catch (e) {}
  Object.defineProperty(window, "speechSynthesis", { value: undefined });
})();
""" % json.dumps({
    "Bus": {"b": 1, "n": 0, "m": 1},
    "Tisch": {"b": 1, "n": 99}, "Lampe": {"b": 1, "n": 99}, "Fenster": {"b": 1, "n": 99},
    "Haus": {"b": 3, "n": 99}, "Katze": {"b": 3, "n": 99}, "Buch": {"b": 3, "n": 99},
})

SHOTS = [
    # (file, width, height, scale, scheme)
    (DOCS / "desktop-light.png", 1280, 900, 1, "light"),
    (DOCS / "desktop-dark.png", 1280, 900, 1, "dark"),
    (DOCS / "phone-light.png", 390, 844, 2, "light"),
    (DOCS / "phone-dark.png", 390, 844, 2, "dark"),
    (ROOT / "tools" / "banner" / "app.png", 1280, 900, 2, "dark"),
]


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", args=["--disable-lcd-text"])
        for out, w, h, scale, scheme in SHOTS:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=scale,
                                      color_scheme=scheme, reduced_motion="reduce")
            ctx.add_init_script(SEED)
            page = ctx.new_page()
            page.goto((ROOT / "index.html").as_uri())
            page.evaluate("document.fonts.ready")
            noun = page.text_content("#noun")
            if noun != "Bus":
                raise SystemExit(f"expected der Bus on the card, got {noun!r}")
            page.click('.choice[data-article="die"]')
            page.mouse.move(0, 0)
            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(300)
            page.screenshot(path=str(out), full_page=True)
            ctx.close()
            print(out)
        browser.close()


if __name__ == "__main__":
    main()
