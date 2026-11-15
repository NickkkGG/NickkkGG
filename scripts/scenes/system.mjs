// "system check": the stack, printed line by line like a computer booting.

import { tv, PHOSPHOR } from "../lib/crt.mjs";
import { textUses } from "../lib/font.mjs";

export const SYSTEM_LINES = [
  "NICK-OS v1.0  SYSTEM CHECK",
  "",
  "TypeScript ........ OK    React / Next.js ... OK",
  "Three.js / R3F .... OK    Swift / Metal ..... OK",
  "Python ............ OK    Cloudflare ........ OK",
  "Blender ........... OK    Figma ............. OK",
  "",
  "ALL SYSTEMS GO_",
];

const LOOP_MS = 10000;
const STEP_MS = 380;
const PX = 2.4;
const LINE_H = 26;

export function renderSystem() {
  return tv({
    id: "sys",
    w: 830,
    h: 280,
    inset: { t: 20, r: 24, b: 32, l: 24 },
    label: "NN-14",
    content: () =>
      SYSTEM_LINES.map((line, i) => {
        if (!line.trim()) return "";
        const show = (((i + 1) * STEP_MS) / LOOP_MS).toFixed(3);
        return (
          `<g class="boot-line" opacity="0">` +
          `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${show};0.94" dur="${LOOP_MS / 1000}s" repeatCount="indefinite"/>` +
          textUses(line, 26, 22 + i * LINE_H, PX, PHOSPHOR) +
          `</g>`
        );
      }).join(""),
  });
}
