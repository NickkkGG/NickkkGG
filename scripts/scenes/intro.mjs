// The small TV next to the intro text, showing the owner's picture like a recording.

import { fileURLToPath } from "node:url";
import { tv, PHOSPHOR, LED } from "../lib/crt.mjs";
import { jpegDataUri } from "../lib/image.mjs";
import { textUses } from "../lib/font.mjs";

const PHOTO = fileURLToPath(new URL("../stills/cat.jpg", import.meta.url));

export function renderIntroTv() {
  return tv({
    id: "intro",
    w: 300,
    h: 300,
    inset: { t: 18, r: 18, b: 36, l: 18 },
    radius: 16,
    glow: false,
    label: "NN-07",
    content: ({ w, h }) =>
      `<filter id="intro-dim"><feColorMatrix type="saturate" values="0.7"/></filter>` +
      `<image href="${jpegDataUri(PHOTO)}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" filter="url(#intro-dim)"/>` +
      `<g filter="url(#intro-glow)">` +
      `<circle cx="20" cy="${h - 19}" r="4" fill="${LED}"><animate attributeName="opacity" calcMode="discrete" values="1;0" keyTimes="0;0.5" dur="1.2s" repeatCount="indefinite"/></circle>` +
      textUses("REC NICK", 30, h - 26, 2, PHOSPHOR) +
      `</g>`,
  });
}
