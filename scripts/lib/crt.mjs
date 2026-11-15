// The CRT television every panel lives in: a plastic bezel, a rounded glass screen with
// phosphor glow, scanlines, a dark vignette, a slow flicker, a power LED and a model label.

import { glyphDefsFor, textUses, textWidth } from "./font.mjs";
import { svgDoc } from "./svg.mjs";

export const PHOSPHOR = "#8dffa6";
export const SCREEN_BG = "#03140a";
export const BEZEL = "#2b2824";
export const BEZEL_EDGE = "#3a3631";
export const LABEL = "#6f675d";
export const LED = "#ff5a3c";

/**
 * A complete SVG of a TV. `content` receives the screen size and returns elements drawn in
 * screen coordinates (0,0 is the screen's top-left). With `glow` false the content is drawn
 * without the phosphor blur; it can still opt in per element with filter="url(#<id>-glow)".
 */
export function tv({ id, w, h, inset, radius = 26, content, label, led = true, glow = true, screenBg = SCREEN_BG }) {
  const sw = w - inset.l - inset.r;
  const sh = h - inset.t - inset.b;
  const inner = content({ w: sw, h: sh });

  const defs =
    `<clipPath id="${id}-clip"><rect width="${sw}" height="${sh}" rx="${radius}" ry="${radius * 1.3}"/></clipPath>` +
    `<filter id="${id}-glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<pattern id="${id}-scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect y="2" width="4" height="1" fill="#000" fill-opacity="0.32"/></pattern>` +
    `<radialGradient id="${id}-vig" cx="50%" cy="50%" r="72%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/></radialGradient>` +
    `<linearGradient id="${id}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.05"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>`;

  const bezel =
    `<rect width="${w}" height="${h}" rx="22" fill="${BEZEL}"/>` +
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="21" fill="url(#${id}-shade)" stroke="${BEZEL_EDGE}" stroke-width="2"/>`;

  const flicker = `<animate attributeName="opacity" calcMode="discrete" values="1;0.94;1;0.97;1" keyTimes="0;0.41;0.42;0.77;0.78" dur="4s" repeatCount="indefinite"/>`;

  const screen =
    `<g transform="translate(${inset.l} ${inset.t})" clip-path="url(#${id}-clip)">` +
    `<rect width="${sw}" height="${sh}" fill="${screenBg}"/>` +
    `<g${glow ? ` filter="url(#${id}-glow)"` : ""}>${flicker}${inner}</g>` +
    `<rect width="${sw}" height="${sh}" fill="url(#${id}-scan)"/>` +
    `<rect width="${sw}" height="${sh}" fill="url(#${id}-vig)"/>` +
    `</g>` +
    `<rect x="${inset.l - 1}" y="${inset.t - 1}" width="${sw + 2}" height="${sh + 2}" rx="${radius + 1}" ry="${radius * 1.3 + 1}" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="2"/>`;

  const ledDot = led ? `<circle cx="${inset.l + 6}" cy="${h - inset.b / 2}" r="3" fill="${LED}"/><circle cx="${inset.l + 6}" cy="${h - inset.b / 2}" r="6" fill="${LED}" fill-opacity="0.18"/>` : "";
  const labelPx = 1.5;
  const labelText = label ? textUses(label, w - inset.r - 6 - textWidth(label, labelPx), h - inset.b / 2 - 3.5 * labelPx, labelPx, LABEL) : "";

  const body = bezel + screen + ledDot + labelText;
  return svgDoc(w, h, `<defs>${defs}${glyphDefsFor(body)}</defs>${body}`);
}
