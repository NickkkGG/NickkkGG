// The running dino and its cactus, as pixel art. Legs swap every `legMs`; the runner scene
// times the jump so the dino clears the cactus on every loop.

import { round } from "./font.mjs";

const BODY = [
  "............########..",
  "...........##.########",
  "...........###########",
  "...........###########",
  "...........######.....",
  "...........#########..",
  "#.........######......",
  "#........########.....",
  "##.....###########....",
  "###...#########.##....",
  "##############........",
  ".############.........",
  "..###########.........",
  "...#########..........",
  "....#######...........",
];
const LEG_A = [".....###.###..........", ".....##...##..........", ".....#.....#..........", ".....##....##........."];
const LEG_B = [".....###.###..........", ".....###...#..........", "......##...##.........", "...........#.........."];
const CACTUS = ["..##..", "..##.#", "#.##.#", "#.####", "####..", "..##..", "..##..", "..##.."];

export const DINO_W = 22;
export const DINO_H = 19;
export const CACTUS_W = 6;
export const CACTUS_H = 8;

/** Path data for a bitmap, one rectangle per horizontal run, scaled by px and shifted down by dy rows. */
function bitmapPath(rows, px, dy = 0) {
  let d = "";
  rows.forEach((row, y) => {
    for (const m of row.matchAll(/#+/g)) d += `M${m.index * px} ${(y + dy) * px}h${m[0].length * px}v${px}h-${m[0].length * px}z`;
  });
  return d;
}

/** The dino as a group at the origin, DINO_W×DINO_H pixels of size px, legs running. */
export function dino({ px, color, legMs = 200 }) {
  const dur = `${(legMs * 2) / 1000}s`;
  const swap = (from, to) => `<animate attributeName="visibility" calcMode="discrete" values="${from};${to}" keyTimes="0;0.5" dur="${dur}" repeatCount="indefinite"/>`;
  return (
    `<g fill="${color}">` +
    `<path d="${bitmapPath(BODY, px)}"/>` +
    `<path d="${bitmapPath(LEG_A, px, 15)}">${swap("visible", "hidden")}</path>` +
    `<path d="${bitmapPath(LEG_B, px, 15)}" visibility="hidden">${swap("hidden", "visible")}</path>` +
    `</g>`
  );
}

/** The cactus as a group at the origin. */
export function cactus({ px, color }) {
  return `<path d="${bitmapPath(CACTUS, px)}" fill="${color}"/>`;
}

/**
 * Ground, a cactus sliding from the right edge to off the left edge, and the dino jumping
 * over it at x = 8% of the width. Ground line top sits at groundY.
 */
export function runner({ w, groundY, px, color, cycleMs = 2400 }) {
  const dur = `${cycleMs / 1000}s`;
  const dinoX = round(0.08 * w);
  const dw = DINO_W * px;
  const cw = CACTUS_W * px;
  const jumpH = round(CACTUS_H * px * 1.6);

  // The cactus centre passes the dino's centre at fraction p of the loop.
  const p = (w - (dinoX + dw / 2) + cw / 2) / (w + cw);
  const k = (f) => Math.min(Math.max(f, 0.001), 0.999).toFixed(4);
  const jumpTimes = `0;${k(p - 0.1)};${k(p - 0.05)};${k(p)};${k(p + 0.05)};${k(p + 0.1)};1`;
  const jumpValues = `${dinoX} 0;${dinoX} 0;${dinoX} ${-jumpH * 0.78};${dinoX} ${-jumpH};${dinoX} ${-jumpH * 0.78};${dinoX} 0;${dinoX} 0`;

  let dots = "";
  for (let x = 0; x < w + 24; x += 23) dots += `<rect x="${x}" y="${groundY + 4}" width="${px * 0.7}" height="${px * 0.7}"/>`;

  return (
    `<g fill="${color}">` +
    `<rect y="${groundY}" width="${w}" height="2"/>` +
    `<g>${dots}<animateTransform attributeName="transform" type="translate" values="0 0;-23 0" dur="0.9s" repeatCount="indefinite"/></g>` +
    `</g>` +
    `<g transform="translate(${w} ${groundY - CACTUS_H * px})">${cactus({ px, color })}` +
    `<animateTransform attributeName="transform" type="translate" values="${w} ${groundY - CACTUS_H * px};${-cw} ${groundY - CACTUS_H * px}" dur="${dur}" repeatCount="indefinite"/></g>` +
    `<g transform="translate(0 ${groundY - DINO_H * px})"><g transform="translate(${dinoX} 0)">${dino({ px, color })}` +
    `<animateTransform attributeName="transform" type="translate" values="${jumpValues}" keyTimes="${jumpTimes}" dur="${dur}" repeatCount="indefinite"/></g></g>`
  );
}
