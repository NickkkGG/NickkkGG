import { test } from "node:test";
import assert from "node:assert/strict";
import { CHANNELS, renderChannel } from "../scripts/scenes/channels.mjs";
import { assertWellFormed, externalUrls } from "./helpers.mjs";

test("the three channels carry the spec's names and on-screen status", () => {
  assert.deepEqual(
    CHANNELS.map((c) => [c.file, c.ch, c.name, c.status, c.phosphor]),
    [
      ["ch01-dino.svg", "CH 01", "DINO WITH FRIENDS", "LIVE · PLAY IN YOUR BROWSER", true],
      ["ch02-dont-let-it-in.svg", "CH 02", "DON'T LET IT IN", "IN DEVELOPMENT · iPHONE", false],
      ["ch03-portfolio.svg", "CH 03", "PORTFOLIO", "LIVE · SCROLL IT", false],
    ],
  );
});

test("each channel embeds its three stills and stays within 400 KB", () => {
  for (const c of CHANNELS) {
    const svg = renderChannel(c);
    assertWellFormed(svg);
    assert.deepEqual(externalUrls(svg), [], c.file);
    assert.equal(svg.match(/href="data:image\/jpeg;base64,/g).length, 3, c.file);
    assert.ok(Buffer.byteLength(svg) <= 400 * 1024, `${c.file} is ${Buffer.byteLength(svg)} bytes`);
  }
});

test("only the dino channel turns its stills phosphor green", () => {
  const [dino, dlii, portfolio] = CHANNELS.map(renderChannel);
  assert.match(dino, /feColorMatrix type="matrix"/);
  assert.doesNotMatch(dlii, /feColorMatrix type="matrix"/);
  assert.doesNotMatch(portfolio, /feColorMatrix type="matrix"/);
});

test("the stills take turns: each is visible for a different third of the loop", () => {
  const svg = renderChannel(CHANNELS[1]);
  const shows = [...svg.matchAll(/<image[^>]*>\s*<animate[^>]*values="([^"]+)"[^>]*keyTimes="([^"]+)"/g)].map((m) => m[2]);
  assert.equal(new Set(shows).size, 3);
});
