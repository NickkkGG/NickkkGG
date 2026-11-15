// CH 00 · HOME: the big monitor at the top of the profile.

import { tv, PHOSPHOR } from "../lib/crt.mjs";
import { runner } from "../lib/dino.mjs";
import { textUses, textWidth } from "../lib/font.mjs";
import { typingSvg } from "../lib/typing.mjs";

export const HEADER_LINES = [
  "hi, I'm Nick.",
  "sugeng rawuh. welcome in.",
  "I build games and strange websites.",
  "building a PS1 horror game for iPhone.",
  "information systems @ UAJY, Yogyakarta.",
];

const W = 830;
const H = 230;
const INSET = { t: 20, r: 24, b: 30, l: 24 };
export const HEADER_SCREEN_W = W - INSET.l - INSET.r;
export const HEADER_MARGIN = 24;
export const HEADER_TEXT_PX = 3;

export function renderHeader() {
  return tv({
    id: "hdr",
    w: W,
    h: H,
    inset: INSET,
    label: "NN-14",
    content: ({ w, h }) => {
      const osdPx = 2;
      const right = "CH 00 · HOME";
      return (
        `<g opacity="0.75">` +
        textUses("NICK-OS v1.0", HEADER_MARGIN, 16, osdPx, PHOSPHOR) +
        textUses(right, w - HEADER_MARGIN - textWidth(right, osdPx), 16, osdPx, PHOSPHOR) +
        `</g>` +
        typingSvg(HEADER_LINES, { x: HEADER_MARGIN, y: 46, px: HEADER_TEXT_PX, color: PHOSPHOR }) +
        runner({ w, groundY: h - 22, px: 3, color: PHOSPHOR })
      );
    },
  });
}
