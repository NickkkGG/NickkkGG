import { test } from "node:test";
import assert from "node:assert/strict";
import { GLYPHS, GLYPH_W, GLYPH_H, assertGlyphs, glyphDefs, textUses, textWidth } from "../scripts/lib/font.mjs";

const COPY_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'\":;@-·/_!?()&>";

test("every glyph is 7 rows of 5 cells drawn with # and .", () => {
  for (const [ch, rows] of Object.entries(GLYPHS)) {
    assert.equal(rows.length, GLYPH_H, `glyph ${JSON.stringify(ch)} height`);
    for (const row of rows) {
      assert.equal(row.length, GLYPH_W, `glyph ${JSON.stringify(ch)} row "${row}"`);
      assert.match(row, /^[#.]+$/, `glyph ${JSON.stringify(ch)} row "${row}"`);
    }
  }
});

test("every character the profile copy uses has a glyph", () => {
  assert.doesNotThrow(() => assertGlyphs(COPY_CHARS));
});

test("a character without a glyph fails loudly", () => {
  assert.throws(() => assertGlyphs("é"), { message: 'missing glyph: "é"' });
});

test("text width counts a one-pixel gap between letters but not after the last", () => {
  assert.equal(textWidth("hi", 3), 33);
  assert.equal(textWidth("", 3), 0);
});

test("glyph defs hold one path per distinct visible character", () => {
  const defs = glyphDefs("aa b");
  assert.equal(defs.match(/<path/g).length, 2);
});

test("text uses place one glyph per visible character", () => {
  const uses = textUses("a b", 0, 0, 2, "#fff");
  assert.equal(uses.match(/<use/g).length, 2);
});
