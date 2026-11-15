// "signal": the last year of contributions drawn as a level. One bar per week scrolls past
// while the dino hops along; the numbers underneath come from the same data.

import { tv, PHOSPHOR, SCREEN_BG } from "../lib/crt.mjs";
import { dino, DINO_H } from "../lib/dino.mjs";
import { textUses, textWidth, round } from "../lib/font.mjs";

const MAX_REPO = 24;
const W = 830;
const INSET = { t: 20, r: 24, b: 42, l: 24 };
export const SIGNAL_SCREEN_W = W - INSET.l - INSET.r;
export const READOUT_PX = 2.2;

/** The two readout lines under the level. */
export function readouts(d) {
  return [`${d.total} CONTRIBUTIONS · BEST WEEK ${d.bestWeek}`, `LAST PUSH: ${shortRepo(d.lastPush)}`];
}

/** A repo name cut to 24 characters ("..": the cut), or "-" when there is none. */
export function shortRepo(name) {
  if (!name) return "-";
  return name.length <= MAX_REPO ? name : `${name.slice(0, MAX_REPO - 2)}..`;
}

export function renderSignal(d) {
  return tv({
    id: "sig",
    w: W,
    h: 300,
    inset: INSET,
    label: "NN-14",
    content: ({ w, h }) => {
      const m = 22;
      const px = READOUT_PX;
      const groundY = h - 76;
      const barTop = 48;
      const maxH = groundY - barTop;
      const peak = Math.max(0, ...d.weeks);
      const slot = w / d.weeks.length;
      const barW = round(slot - 3);

      const bars = (offset) =>
        d.weeks
          .map((v, i) => {
            const bh = peak > 0 ? Math.max(2, round((v / peak) * maxH)) : 2;
            return `<rect class="bar" x="${round(offset + i * slot + 1.5)}" y="${round(groundY - bh)}" width="${barW}" height="${bh}"/>`;
          })
          .join("");

      const dinoPx = 2;
      const hop = round(maxH * 0.85);
      const right = "UPDATED DAILY";
      const [line1, line2] = readouts(d);

      return (
        textUses("MY YEAR AS A LEVEL", m, 16, px, PHOSPHOR) +
        `<g opacity="0.7">${textUses(right, w - m - textWidth(right, 1.8), 18, 1.8, PHOSPHOR)}</g>` +
        `<g fill="${PHOSPHOR}">` +
        `<g>${bars(0)}${bars(w)}<animateTransform attributeName="transform" type="translate" values="0 0;${-w} 0" dur="26s" repeatCount="indefinite"/></g>` +
        `<rect y="${groundY}" width="${w}" height="2"/>` +
        `</g>` +
        `<filter id="sig-outline" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.5" result="d"/><feFlood flood-color="${SCREEN_BG}"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
        `<g transform="translate(${round(w * 0.1)} ${groundY - DINO_H * dinoPx})" filter="url(#sig-outline)"><g>${dino({ px: dinoPx, color: PHOSPHOR })}` +
        `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-hop};0 0" keyTimes="0;0.5;1" keySplines="0.2 0.6 0.4 1;0.6 0 0.8 0.4" calcMode="spline" dur="1.3s" repeatCount="indefinite"/></g></g>` +
        textUses(line1, m, h - 58, px, PHOSPHOR) +
        textUses(line2, m, h - 32, px, PHOSPHOR)
      );
    },
  });
}
