// A line of text that types itself, holds, deletes itself and moves on to the next line,
// looping forever. Every letter gets its own discrete opacity animation on one shared clock.

import { ADVANCE, GLYPH_H, GLYPH_W, textUses, round } from "./font.mjs";

const DEFAULTS = { typeMs: 70, holdMs: 1700, deleteMs: 25, gapMs: 400, startMs: 300 };

/** When each character appears and disappears, and where the cursor sits over time. */
export function timeline(lines, o = {}) {
  const { typeMs, holdMs, deleteMs, gapMs, startMs } = { ...DEFAULTS, ...o };
  const chars = [];
  const cursor = [{ tMs: 0, col: 0 }];
  let t = startMs;
  lines.forEach((line, li) => {
    const n = [...line].length;
    for (let k = 0; k < n; k++) {
      const showMs = t + (k + 1) * typeMs;
      const hideMs = t + n * typeMs + holdMs + (n - k) * deleteMs;
      chars.push({ line: li, index: k, showMs, hideMs });
    }
    for (let k = 0; k < n; k++) cursor.push({ tMs: t + (k + 1) * typeMs, col: k + 1 });
    for (let k = n - 1; k >= 0; k--) cursor.push({ tMs: t + n * typeMs + holdMs + (n - k) * deleteMs, col: k });
    t += n * typeMs + holdMs + n * deleteMs + gapMs;
  });
  return { durMs: t, chars, cursor };
}

const kt = (ms, dur) => (ms / dur).toFixed(5).replace(/0+$/, "").replace(/\.$/, "");

/** The typing line as SVG elements (glyph defs are added by whoever builds the document). */
export function typingSvg(lines, { x, y, px, color, ...timing }) {
  const t = timeline(lines, timing);
  const dur = `${round(t.durMs / 1000)}s`;
  let out = "";
  for (const c of t.chars) {
    const ch = [...lines[c.line]][c.index];
    if (ch === " ") continue;
    const use = textUses(ch, x + c.index * ADVANCE * px, y, px, color);
    const anim = `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${kt(c.showMs, t.durMs)};${kt(c.hideMs, t.durMs)}" dur="${dur}" repeatCount="indefinite"/>`;
    out += use.replace("/>", ` opacity="0">${anim}</use>`);
  }
  const values = t.cursor.map((c) => `${round(c.col * ADVANCE * px)} 0`).join(";");
  const keyTimes = t.cursor.map((c) => kt(c.tMs, t.durMs)).join(";");
  out +=
    `<rect x="${round(x)}" y="${round(y - px * 0.5)}" width="${round(GLYPH_W * px)}" height="${round((GLYPH_H + 1) * px)}" fill="${color}">` +
    `<animateTransform attributeName="transform" type="translate" calcMode="discrete" values="${values}" keyTimes="${keyTimes}" dur="${dur}" repeatCount="indefinite"/>` +
    `<animate attributeName="opacity" calcMode="discrete" values="1;0" keyTimes="0;0.5" dur="1s" repeatCount="indefinite"/>` +
    `</rect>`;
  return out;
}
