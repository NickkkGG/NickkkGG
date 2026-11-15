// The sign-off: "thanks for tuning in.", then the picture collapses to a dot like an old TV
// switching off, and the loop starts again.

import { tv, PHOSPHOR } from "../lib/crt.mjs";
import { textUses, textWidth } from "../lib/font.mjs";

const TEXT = "thanks for tuning in.";

export function renderFooter() {
  return tv({
    id: "off",
    w: 830,
    h: 130,
    inset: { t: 16, r: 24, b: 26, l: 24 },
    radius: 18,
    screenBg: "#020202",
    content: ({ w, h }) => {
      const cx = w / 2;
      const cy = h / 2;
      const keyTimes = "0;0.3;0.31;0.44;0.56;0.66;0.8;1";
      const widths = [w, w, w, w, 6, 4, 0, 0];
      const heights = [h, h, h, 3, 3, 4, 0, 0];
      const anim = (attr, vals) => `<animate attributeName="${attr}" values="${vals.join(";")}" keyTimes="${keyTimes}" dur="5s" repeatCount="indefinite"/>`;
      const px = 3;
      return (
        `<rect x="0" y="0" width="${w}" height="${h}" fill="${PHOSPHOR}" opacity="0">` +
        anim("width", widths) +
        anim("height", heights) +
        anim("x", widths.map((v) => cx - v / 2)) +
        anim("y", heights.map((v) => cy - v / 2)) +
        `<animate attributeName="opacity" calcMode="discrete" values="0;0.9;1;0" keyTimes="0;0.31;0.44;0.8" dur="5s" repeatCount="indefinite"/>` +
        `</rect>` +
        `<g opacity="1"><animate attributeName="opacity" calcMode="discrete" values="1;0" keyTimes="0;0.31" dur="5s" repeatCount="indefinite"/>` +
        textUses(TEXT, cx - textWidth(TEXT, px) / 2, cy - 3.5 * px, px, PHOSPHOR) +
        `</g>`
      );
    },
  });
}
