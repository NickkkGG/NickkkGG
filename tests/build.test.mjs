import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { buildAll } from "../scripts/build.mjs";
import { assertWellFormed, externalUrls } from "./helpers.mjs";

const README = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const KB = 1024;

test("the build writes all eleven panels, each self-contained and within budget", async () => {
  const dir = mkdtempSync(join(tmpdir(), "assets-"));
  const files = await buildAll(dir);
  assert.equal(files.length, 11);
  for (const f of files) {
    const svg = readFileSync(f, "utf8");
    assertWellFormed(svg);
    assert.deepEqual(externalUrls(svg), [], f);
    const budget = basename(f).startsWith("ch0") ? 400 * KB : 150 * KB;
    assert.ok(Buffer.byteLength(svg) <= budget, `${f} is ${Buffer.byteLength(svg)} bytes`);
  }
});

test("the readme shows every built panel and the daily signal from the output branch", async () => {
  const files = await buildAll(mkdtempSync(join(tmpdir(), "assets-")));
  for (const f of files) assert.ok(README.includes(`assets/${basename(f)}`), `README misses assets/${basename(f)}`);
  assert.ok(README.includes("https://raw.githubusercontent.com/NickkkGG/NickkkGG/output/signal.svg"));
});

test("the readme carries the spec's copy word for word", () => {
  const copy = [
    "**Nick Nelson** here. Information Systems student at Universitas Atma Jaya Yogyakarta, Indonesia.",
    "I like making things that feel like objects you could touch: a CRT that boots, a VHS tape you can pick up, a dino that races your friends. Right now I'm finishing a PS1-style horror game for iPhone.",
    "Off the clock I'm student staff at my campus's student affairs and career office, where I build the student services portal.",
    "The offline dino game, but you race your friends. Make a lobby, send the code, and everyone runs the same desert in real time. Crash early and you get to watch the rest.",
    "A PS1-style horror game for iPhone. You work the night shift alone at a warnet, and every message, email and visitor could be a scam. Spot it, or let it in.",
    "My portfolio as one long 3D scroll: a lived-in room, a fall through the floor, CRTs hanging in the dark and VHS tapes for contact.",
    "an MCP server for my campus LMS: courses, deadlines and materials, straight into an AI assistant.",
  ];
  for (const line of copy) assert.ok(README.includes(line), `README misses: ${line}`);
  for (const tag of ["`TypeScript`", "`React`", "`Cloudflare Workers`", "`Durable Objects`", "`Swift`", "`Metal`", "`iOS`", "`Next.js`", "`React Three Fiber`", "`Three.js`", "`Blender`", "`MCP`"]) {
    assert.ok(README.includes(tag), `README misses tag ${tag}`);
  }
});

test("the readme leaves out the projects the owner kept off the page", () => {
  assert.doesNotMatch(README, /AURUM|aurum|kkpka-portal/);
});
