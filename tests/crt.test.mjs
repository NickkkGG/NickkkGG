import { test } from "node:test";
import assert from "node:assert/strict";
import { tv } from "../scripts/lib/crt.mjs";
import { renderHeader, HEADER_LINES } from "../scripts/scenes/header.mjs";
import { assertWellFormed, externalUrls } from "./helpers.mjs";

test("the tv shell is a well-formed svg with a clipped screen and scanlines", () => {
  const svg = tv({ id: "t", w: 400, h: 200, inset: { t: 10, r: 10, b: 20, l: 10 }, content: () => "<rect/>", label: "NN-14" });
  assertWellFormed(svg);
  assert.match(svg, /<clipPath/);
  assert.match(svg, /<pattern/);
  assert.deepEqual(externalUrls(svg), []);
});

test("the tv shell defines every glyph its label uses", () => {
  const svg = tv({ id: "t", w: 400, h: 200, inset: { t: 10, r: 10, b: 20, l: 10 }, content: () => "", label: "NN-14" });
  for (const id of new Set([...svg.matchAll(/href="#(g[0-9a-f]+)"/g)].map((m) => m[1]))) {
    assert.match(svg, new RegExp(`<path id="${id}"`), `glyph ${id} used but not defined`);
  }
});

test("the header types the five lines from the spec", () => {
  assert.deepEqual(HEADER_LINES, [
    "hi, I'm Nick.",
    "sugeng rawuh. welcome in.",
    "I build games and strange websites.",
    "building a PS1 horror game for iPhone.",
    "information systems @ UAJY, Yogyakarta.",
  ]);
  const svg = renderHeader();
  const visible = HEADER_LINES.join("").replace(/ /g, "").length;
  assert.equal(svg.match(/values="0;1;0"/g).length, visible);
});

test("the header is a small, self-contained svg", () => {
  const svg = renderHeader();
  assertWellFormed(svg);
  assert.deepEqual(externalUrls(svg), []);
  assert.ok(Buffer.byteLength(svg) <= 150 * 1024, `header is ${Buffer.byteLength(svg)} bytes`);
  assert.match(svg, /<use /);
});

test("the longest typed line fits on the screen", async () => {
  const { textWidth } = await import("../scripts/lib/font.mjs");
  const { HEADER_TEXT_PX, HEADER_SCREEN_W, HEADER_MARGIN } = await import("../scripts/scenes/header.mjs");
  const longest = Math.max(...HEADER_LINES.map((l) => textWidth(l, HEADER_TEXT_PX)));
  assert.ok(longest + HEADER_TEXT_PX * 6 <= HEADER_SCREEN_W - 2 * HEADER_MARGIN, `longest line ${longest}`);
});
