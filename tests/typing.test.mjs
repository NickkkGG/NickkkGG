import { test } from "node:test";
import assert from "node:assert/strict";
import { timeline, typingSvg } from "../scripts/lib/typing.mjs";

const opts = { typeMs: 70, holdMs: 1700, deleteMs: 25, gapMs: 400, startMs: 300 };

test("every visible and invisible character gets a show and a hide time", () => {
  const t = timeline(["hi.", "ok"], opts);
  assert.equal(t.chars.length, 5);
  for (const c of t.chars) {
    assert.ok(0 < c.showMs && c.showMs < c.hideMs && c.hideMs < t.durMs, JSON.stringify(c));
  }
});

test("a line only starts typing after the previous line is fully deleted", () => {
  const t = timeline(["hi.", "ok"], opts);
  const lastHideOfFirst = Math.max(...t.chars.filter((c) => c.line === 0).map((c) => c.hideMs));
  const firstShowOfSecond = Math.min(...t.chars.filter((c) => c.line === 1).map((c) => c.showMs));
  assert.ok(firstShowOfSecond > lastHideOfFirst);
});

test("the loop lasts exactly as long as typing, holding, deleting and pausing every line", () => {
  const t = timeline(["hi.", "ok"], opts);
  const expected = 300 + (3 * 70 + 1700 + 3 * 25 + 400) + (2 * 70 + 1700 + 2 * 25 + 400);
  assert.equal(t.durMs, expected);
});

test("the cursor ends each typed line one column past its last letter", () => {
  const t = timeline(["hi."], opts);
  assert.equal(Math.max(...t.cursor.map((c) => c.col)), 3);
  assert.equal(t.cursor[0].col, 0);
});

test("every keyTimes list in the svg rises strictly inside 0..1", () => {
  const svg = typingSvg(["hi, I'm Nick.", "ok"], { x: 10, y: 10, px: 3, color: "#8dffa6", ...opts });
  const lists = [...svg.matchAll(/keyTimes="([^"]+)"/g)].map((m) => m[1].split(";").map(Number));
  assert.ok(lists.length > 0);
  for (const kt of lists) {
    assert.equal(kt[0], 0);
    for (let i = 1; i < kt.length; i++) {
      assert.ok(kt[i] > kt[i - 1] && kt[i] < 1, `keyTimes not rising: ${kt.join(";")}`);
    }
  }
});

test("spaces are timed but never drawn", () => {
  const svg = typingSvg(["a b"], { x: 0, y: 0, px: 2, color: "#fff", ...opts });
  assert.equal(svg.match(/<use /g).length, 2);
});
