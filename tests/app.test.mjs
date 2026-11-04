// Runs app.js against a small stand-in for the browser and plays the game.
// Run with: node tests/app.test.mjs   (exits 1 if a test fails)
//
// The stand-in is built from the real index.html, so an id that app.js needs
// and the page lacks fails here too. It has no layout: anything about pixels
// is checked by hand in a browser.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = (file) => readFileSync(join(root, file), "utf8");
const html = source("index.html");
const STORE_KEY = "artikel.progress.v1";

class Emitter {
  constructor() { this.listeners = {}; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  emit(type, event = {}) {
    const e = { target: this, preventDefault() { this.defaultPrevented = true; }, ...event };
    for (const fn of this.listeners[type] || []) fn(e);
    return e;
  }
}

class El extends Emitter {
  constructor(doc, tag, attrs = {}) {
    super();
    this.doc = doc;
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attrs };
    this.kids = [];
    this.text = "";
    this.style = { setProperty() {} };
    this.hidden = "hidden" in attrs;
    this.disabled = false;
    this.checked = "checked" in attrs;
    this.value = attrs.value ?? "";
    this.type = attrs.type ?? "";
    this.id = attrs.id ?? "";
    this.open = false;
    this.scrolled = [];
    this.rect = { left: 0, right: 0, top: 0, bottom: 0 };
    const classes = new Set((attrs.class ?? "").split(/\s+/).filter(Boolean));
    this.classes = classes;
    this.classList = {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      contains: (c) => classes.has(c),
      toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)),
    };
  }
  get textContent() { return this.text + this.kids.map((k) => (typeof k === "string" ? k : k.textContent)).join(""); }
  set textContent(v) { this.text = String(v); this.kids = []; }
  get className() { return [...this.classes].join(" "); }
  set className(v) { this.classes.clear(); String(v).split(/\s+/).filter(Boolean).forEach((c) => this.classes.add(c)); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  append(...nodes) { this.kids.push(...nodes); }
  appendChild(node) { this.kids.push(node); return node; }
  querySelector(sel) { return (this.parts ||= {})[sel] ||= new El(this.doc, "span"); }
  focus(options) { this.doc.activeElement = this; this.focusOptions = options; }
  scrollIntoView(options) { this.scrolled.push(options); }
  getBoundingClientRect() { return this.rect; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit("close"); }
  click() { this.emit("click", { target: this }); }
}

function parsePage(doc) {
  const all = [];
  const body = html.slice(html.indexOf("<body"));
  for (const tag of body.matchAll(/<([a-z][a-z0-9]*)\b((?:[^>"]|"[^"]*")*)>/g)) {
    const attrs = {};
    for (const a of tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? "";
    all.push(new El(doc, tag[1], attrs));
  }
  return all;
}

function matches(el, selector) {
  const m = /^([a-z]*)(?:\.([\w-]+))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/.exec(selector);
  if (!m) throw new Error("selector not supported: " + selector);
  const [, tag, cls, attr, value] = m;
  if (tag && el.tagName !== tag.toUpperCase()) return false;
  if (cls && !el.classes.has(cls)) return false;
  if (attr && !(attr in el.attrs)) return false;
  return value === undefined || el.attrs[attr] === value;
}

// Starts the game. stored is the saved progress, as an object or raw string.
function boot({ stored, voices, now = () => Date.parse("2026-11-04T12:00:00") } = {}) {
  const store = new Map();
  if (stored !== undefined) store.set(STORE_KEY, typeof stored === "string" ? stored : JSON.stringify(stored));

  const doc = new Emitter();
  doc.visibilityState = "visible";
  doc.documentElement = new El(doc, "html");
  doc.body = new El(doc, "body");
  doc.activeElement = doc.body;
  doc.createElement = (tag) => new El(doc, tag);
  const page = parsePage(doc);
  doc.getElementById = (id) => page.find((el) => el.id === id) ?? null;
  doc.querySelectorAll = (sel) => page.filter((el) => matches(el, sel));

  const FakeDate = class extends Date {
    constructor(...args) { if (args.length) super(...args); else super(now()); }
    static now() { return now(); }
  };

  const win = new Emitter();
  const timers = [];
  const sandbox = {
    document: doc,
    navigator: {},
    console,
    Date: FakeDate,
    setTimeout,
    clearTimeout,
    setInterval: (fn) => { timers.push(fn); return timers.length; },
  };
  vm.createContext(sandbox);
  const global = vm.runInContext("this", sandbox);
  Object.assign(sandbox, {
    window: global,
    addEventListener: win.addEventListener.bind(win),
    location: { protocol: "file:" },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
    },
  });
  if (voices) {
    sandbox.spoken = [];
    sandbox.speechSynthesis = {
      getVoices: () => voices,
      cancel() {},
      speak: (u) => sandbox.spoken.push(u),
      addEventListener() {},
    };
    sandbox.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  }
  for (const file of ["words.js", "rules.js", "app.js"]) {
    vm.runInContext(source(file), sandbox, { filename: file });
  }

  const $ = (id) => doc.getElementById(id);
  const word = () => sandbox.WORDS.find((w) => w.w === $("noun").textContent);
  const choice = (a) => doc.querySelectorAll(".choice").find((b) => b.getAttribute("data-article") === a);
  const saved = () => JSON.parse(store.get(STORE_KEY));
  return {
    doc, win, $, word, choice, saved, store, sandbox, timers,
    answerRight() { choice(word().a).click(); },
    answerWrong() { choice(["der", "die", "das"].find((a) => a !== word().a)).click(); },
    key(code, extra = {}) {
      return doc.emit("keydown", {
        code,
        key: { Enter: "Enter", Space: " " }[code] ?? code,
        target: doc.activeElement,
        ctrlKey: false, metaKey: false, altKey: false, repeat: false,
        ...extra,
      });
    },
  };
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("a right answer counts, fills the blank and moves the word to box 3", () => {
  const g = boot();
  const w = g.word();
  g.answerRight();
  assert.equal(g.$("slot").textContent, w.a);
  assert.equal(g.$("feedback").hidden, false);
  assert.equal(g.saved().correct, 1);
  assert.equal(g.saved().prog[w.w].b, 3);
});

test("a wrong answer sends the word to box 1 and counts a miss", () => {
  const g = boot();
  const w = g.word();
  g.answerWrong();
  assert.equal(g.saved().correct, 0);
  assert.deepEqual({ b: g.saved().prog[w.w].b, m: g.saved().prog[w.w].m }, { b: 1, m: 1 });
});

test("keys answer by position and Enter moves on", () => {
  const g = boot();
  const first = g.word();
  g.key("KeyD");
  assert.equal(g.saved().answered, 1);
  g.doc.activeElement = g.doc.body;
  g.key("Enter");
  assert.notEqual(g.word(), first);
  assert.equal(g.$("feedback").hidden, true);
});

test("corrupt saves fall back to a working game", () => {
  for (const stored of ["{not json", "null", "5", "[]", { prog: "x", stats: 1, today: 2, goal: "many", level: {} }]) {
    const g = boot({ stored });
    assert.ok(g.word(), `a card shows for ${JSON.stringify(stored)}`);
    g.answerRight();
    assert.equal(g.saved().answered, 1);
  }
});

test("a click on the dialog's padding keeps it open; the backdrop closes it", () => {
  const g = boot();
  const dialog = g.$("stats");
  g.$("stats-open").click();
  dialog.rect = { left: 100, right: 500, top: 50, bottom: 600 };
  dialog.emit("click", { clientX: 106, clientY: 300 });
  assert.equal(dialog.open, true);
  dialog.emit("click", { clientX: 20, clientY: 300 });
  assert.equal(dialog.open, false);
});

// ---- tests end ----

let failed = 0;
for (const { name, fn } of tests) {
  try {
    await fn();
    console.log("ok   " + name);
  } catch (err) {
    failed++;
    console.log("FAIL " + name + "\n     " + err.message);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
