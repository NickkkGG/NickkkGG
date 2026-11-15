// The link buttons under the header, drawn like the push buttons on a TV's front panel.

import { BEZEL, BEZEL_EDGE, PHOSPHOR } from "../lib/crt.mjs";
import { glyphDefsFor, textUses, textWidth } from "../lib/font.mjs";
import { svgDoc } from "../lib/svg.mjs";

export const BUTTONS = [
  { file: "btn-portfolio.svg", label: "PORTFOLIO", href: "https://nick-project-1.vercel.app" },
  { file: "btn-play.svg", label: "PLAY DINO", href: "https://dino-with-friends.nicknelsoon30.workers.dev" },
  { file: "btn-linkedin.svg", label: "LINKEDIN", href: "https://www.linkedin.com/in/nicknelsons" },
  { file: "btn-email.svg", label: "EMAIL", href: "mailto:nickknelsoon30@icloud.com" },
];

const H = 40;
const PX = 2;
const TEXT_X = 28;

export function renderButton(label) {
  const w = TEXT_X + textWidth(label, PX) + 16;
  const body =
    `<rect x="1" y="3" width="${w - 2}" height="${H - 4}" rx="7" fill="#000" fill-opacity="0.5"/>` +
    `<rect x="1" y="1" width="${w - 2}" height="${H - 5}" rx="7" fill="${BEZEL}" stroke="${BEZEL_EDGE}" stroke-width="2"/>` +
    `<rect x="4" y="3" width="${w - 8}" height="2" rx="1" fill="#fff" fill-opacity="0.05"/>` +
    `<circle cx="15" cy="${(H - 5) / 2 + 1}" r="6" fill="${PHOSPHOR}" fill-opacity="0.18">` +
    `<animate attributeName="fill-opacity" values="0.18;0.06;0.18" dur="2.4s" repeatCount="indefinite"/></circle>` +
    `<circle cx="15" cy="${(H - 5) / 2 + 1}" r="3" fill="${PHOSPHOR}"/>` +
    textUses(label, TEXT_X, (H - 5) / 2 + 1 - 3.5 * PX, PX, "#d9d2c5");
  return svgDoc(w, H, `<defs>${glyphDefsFor(body)}</defs>${body}`);
}
