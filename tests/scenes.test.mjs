import { test } from "node:test";
import assert from "node:assert/strict";
import { BUTTONS, renderButton } from "../scripts/scenes/buttons.mjs";
import { renderIntroTv } from "../scripts/scenes/intro.mjs";
import { renderSystem, SYSTEM_LINES } from "../scripts/scenes/system.mjs";
import { renderFooter } from "../scripts/scenes/footer.mjs";
import { assertWellFormed, externalUrls } from "./helpers.mjs";

const KB = 1024;

function assertSelfContained(svg, maxBytes) {
  assertWellFormed(svg);
  assert.deepEqual(externalUrls(svg), []);
  assert.ok(Buffer.byteLength(svg) <= maxBytes, `svg is ${Buffer.byteLength(svg)} bytes`);
}

test("the four link buttons point where the spec says", () => {
  assert.deepEqual(
    BUTTONS.map((b) => [b.file, b.label, b.href]),
    [
      ["btn-portfolio.svg", "PORTFOLIO", "https://nick-project-1.vercel.app"],
      ["btn-play.svg", "PLAY DINO", "https://dino-with-friends.nicknelsoon30.workers.dev"],
      ["btn-linkedin.svg", "LINKEDIN", "https://www.linkedin.com/in/nicknelsons"],
      ["btn-email.svg", "EMAIL", "mailto:nickknelsoon30@icloud.com"],
    ],
  );
});

test("every button is a small self-contained svg whose width grows with its label", () => {
  for (const b of BUTTONS) assertSelfContained(renderButton(b.label), 150 * KB);
  const width = (svg) => Number(svg.match(/viewBox="0 0 ([\d.]+)/)[1]);
  assert.ok(width(renderButton("PLAY DINO")) > width(renderButton("EMAIL")));
});

test("the intro tv embeds the photo instead of linking it", () => {
  const svg = renderIntroTv();
  assertSelfContained(svg, 150 * KB);
  assert.match(svg, /data:image\/jpeg;base64,/);
});

test("the system check boots the stack from the spec, line by line", () => {
  assert.equal(SYSTEM_LINES[0], "NICK-OS v1.0  SYSTEM CHECK");
  assert.equal(SYSTEM_LINES.at(-1), "ALL SYSTEMS GO_");
  for (const tool of ["TypeScript", "React / Next.js", "Three.js / R3F", "Swift / Metal", "Python", "Cloudflare", "Blender", "Figma"]) {
    assert.ok(SYSTEM_LINES.some((l) => l.includes(tool)), `missing ${tool}`);
  }
  const svg = renderSystem();
  assertSelfContained(svg, 150 * KB);
  assert.equal(svg.match(/class="boot-line"/g).length, SYSTEM_LINES.filter((l) => l.trim()).length);
});

test("the footer says goodbye before the screen shuts off", () => {
  const svg = renderFooter();
  assertSelfContained(svg, 150 * KB);
  assert.match(svg, /attributeName="height"/);
});
