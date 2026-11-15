// "now playing": one channel per project. Three stills take turns on screen, with a burst of
// static at every switch, like flicking between channels on an old TV.

import { fileURLToPath } from "node:url";
import { tv, PHOSPHOR } from "../lib/crt.mjs";
import { jpegDataUri } from "../lib/image.mjs";
import { textUses, textWidth } from "../lib/font.mjs";

const still = (name) => fileURLToPath(new URL(`../stills/${name}`, import.meta.url));

export const CHANNELS = [
  {
    file: "ch01-dino.svg",
    ch: "CH 01",
    name: "DINO WITH FRIENDS",
    status: "LIVE · PLAY IN YOUR BROWSER",
    stills: ["ch01-1.jpg", "ch01-2.jpg", "ch01-3.jpg"],
    phosphor: true,
  },
  {
    file: "ch02-dont-let-it-in.svg",
    ch: "CH 02",
    name: "DON'T LET IT IN",
    status: "IN DEVELOPMENT · iPHONE",
    stills: ["ch02-1.jpg", "ch02-2.jpg", "ch02-3.jpg"],
    phosphor: false,
  },
  {
    file: "ch03-portfolio.svg",
    ch: "CH 03",
    name: "PORTFOLIO",
    status: "LIVE · SCROLL IT",
    stills: ["ch03-1.jpg", "ch03-2.jpg", "ch03-3.jpg"],
    phosphor: false,
  },
];

const LOOP_S = 9;

// Inverted brightness tinted to the phosphor colour: white pages turn dark, ink turns green.
const PHOSPHOR_MATRIX = [
  [-0.1176, -0.3955, -0.0399, 0, 0.553],
  [-0.2126, -0.7152, -0.0722, 0, 1],
  [-0.1382, -0.4649, -0.0469, 0, 0.65],
  [0, 0, 0, 1, 0],
]
  .map((r) => r.join(" "))
  .join(" ");

/** Phosphor text with a dark drop shadow so it reads over any picture. */
function osd(text, x, y, px, id) {
  return textUses(text, x + px, y + px, px, "#000").replace(/<use /g, '<use opacity="0.65" ') + `<g filter="url(#${id}-glow)">${textUses(text, x, y, px, PHOSPHOR)}</g>`;
}

export function renderChannel(c) {
  const id = c.file.replace(/\.svg$/, "").replace(/[^a-z0-9]/g, "");
  return tv({
    id,
    w: 830,
    h: 330,
    inset: { t: 20, r: 24, b: 32, l: 24 },
    glow: false,
    screenBg: "#050505",
    content: ({ w, h }) => {
      const third = (i) => (i / 3).toFixed(4);
      const images = c.stills
        .map((name, i) => {
          const values = i === 0 ? "1;0" : i === 1 ? "0;1;0" : "0;1";
          const keyTimes = i === 0 ? `0;${third(1)}` : i === 1 ? `0;${third(1)};${third(2)}` : `0;${third(2)}`;
          return (
            `<image href="${jpegDataUri(still(name))}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="${i === 0 ? 1 : 0}">` +
            `<animate attributeName="opacity" calcMode="discrete" values="${values}" keyTimes="${keyTimes}" dur="${LOOP_S}s" repeatCount="indefinite"/>` +
            `</image>`
          );
        })
        .join("");

      const filters =
        `<filter id="${id}-noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/></filter>` +
        (c.phosphor ? `<filter id="${id}-phos"><feColorMatrix type="matrix" values="${PHOSPHOR_MATRIX}"/></filter>` : "") +
        `<linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="0.25" stop-color="#000" stop-opacity="0"/><stop offset="0.75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></linearGradient>`;

      const statik =
        `<g opacity="0"><animate attributeName="opacity" values="0.8;0;0;0.9;0.8" keyTimes="0;0.07;0.92;0.96;1" dur="${LOOP_S / 3}s" repeatCount="indefinite"/>` +
        `<rect x="-40" y="-40" width="${w + 80}" height="${h + 80}" filter="url(#${id}-noise)">` +
        `<animateTransform attributeName="transform" type="translate" calcMode="discrete" values="0 0;-17 9;11 -13;-6 15" dur="0.24s" repeatCount="indefinite"/></rect></g>`;

      const margin = 22;
      return (
        `<defs>${filters}</defs>` +
        `<g${c.phosphor ? ` filter="url(#${id}-phos)"` : ""}>${images}</g>` +
        `<rect width="${w}" height="${h}" fill="url(#${id}-fade)"/>` +
        statik +
        osd(c.ch, margin, 18, 3, id) +
        osd(c.name, w - margin - textWidth(c.name, 2), 22, 2, id) +
        `<rect x="${margin - 8}" y="${h - 18 - 14 - 7}" width="${textWidth(c.status, 2) + 18}" height="28" rx="3" fill="#000" fill-opacity="0.6"/>` +
        osd(c.status, margin, h - 18 - 14, 2, id)
      );
    },
  });
}
