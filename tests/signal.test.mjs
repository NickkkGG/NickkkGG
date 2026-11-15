import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { parseCalendar, lastPushRepo, weeksFromEvents, fetchSignalData } from "../scripts/signal/contrib.mjs";
import { renderSignal, shortRepo, readouts, READOUT_PX, SIGNAL_SCREEN_W } from "../scripts/signal/render.mjs";
import { textWidth } from "../scripts/lib/font.mjs";
import { assertWellFormed, externalUrls } from "./helpers.mjs";

const calendar = JSON.parse(readFileSync(new URL("./fixtures/calendar.json", import.meta.url)));
const events = JSON.parse(readFileSync(new URL("./fixtures/events.json", import.meta.url)));
const NOW = new Date("2026-11-16T03:00:00Z");

const sample = (over = {}) => ({ weeks: Array(52).fill(3), total: 156, bestWeek: 3, lastPush: "dino-with-friends", updated: "2026-11-16", ...over });

test("the calendar becomes the last 52 weekly totals and the year's total", () => {
  const { weeks, total } = parseCalendar(calendar);
  assert.equal(weeks.length, 52);
  assert.equal(total, 429);
  assert.equal(Math.max(...weeks), 41);
});

test("a short calendar is padded with empty weeks at the start", () => {
  const short = structuredClone(calendar);
  short.data.user.contributionsCollection.contributionCalendar.weeks.splice(0, 50);
  const { weeks } = parseCalendar(short);
  assert.equal(weeks.length, 52);
  assert.deepEqual(weeks.slice(0, 49), Array(49).fill(0));
});

test("the last push is the newest push event's repo, without the owner", () => {
  assert.equal(lastPushRepo(events), "dino-with-friends");
  assert.equal(lastPushRepo([]), null);
});

test("push events fill the recent weeks when the calendar is unavailable", () => {
  const weeks = weeksFromEvents(events, NOW);
  assert.equal(weeks.length, 52);
  assert.equal(weeks[51], 3);
  assert.equal(weeks.reduce((a, b) => a + b, 0), 6);
});

test("a year with no contributions still draws every bar, with no NaN", () => {
  const svg = renderSignal(sample({ weeks: Array(52).fill(0), total: 0, bestWeek: 0 }));
  assertWellFormed(svg);
  assert.deepEqual(externalUrls(svg), []);
  assert.equal(svg.match(/class="bar"/g).length, 104);
});

test("a long repo name is cut to 24 characters", () => {
  assert.equal(shortRepo("a-really-long-repository-name-here"), "a-really-long-reposito..");
  assert.equal(shortRepo("dino-with-friends"), "dino-with-friends");
  assert.equal(shortRepo(null), "-");
});

test("the readouts fit on the screen even with big numbers and a long repo name", () => {
  const lines = readouts(sample({ total: 99999, bestWeek: 999, lastPush: "a-really-long-repository-name-here" }));
  assert.deepEqual(lines, ["99999 CONTRIBUTIONS · BEST WEEK 999", "LAST PUSH: a-really-long-reposito.."]);
  for (const line of lines) assert.ok(textWidth(line, READOUT_PX) <= SIGNAL_SCREEN_W - 2 * 22, `"${line}" is too wide`);
});

test("fetching fails loudly when neither GitHub source answers", async () => {
  const down = async () => { throw new Error("offline"); };
  await assert.rejects(fetchSignalData("NickkkGG", "token", down, NOW));
});

test("fetching falls back to public events when the calendar query errors", async () => {
  const fake = async (url) => {
    if (String(url).endsWith("/graphql")) return { ok: true, json: async () => ({ errors: [{ message: "nope" }] }) };
    return { ok: true, json: async () => events };
  };
  const d = await fetchSignalData("NickkkGG", "token", fake, NOW);
  assert.equal(d.weeks[51], 3);
  assert.equal(d.lastPush, "dino-with-friends");
  assert.equal(d.updated, "2026-11-16");
});

test("when the api is down the cli exits non-zero and leaves no file behind", () => {
  const out = join(mkdtempSync(join(tmpdir(), "signal-")), "signal.svg");
  const r = spawnSync(process.execPath, ["scripts/signal.mjs", "--login", "NickkkGG", "--out", out], {
    env: { ...process.env, SIGNAL_API: "http://127.0.0.1:9", GITHUB_TOKEN: "x" },
    encoding: "utf8",
  });
  assert.equal(r.status, 1, r.stderr);
  assert.equal(existsSync(out), false);
});

test("the sample mode writes a signal file from the fixtures", () => {
  const out = join(mkdtempSync(join(tmpdir(), "signal-")), "signal.svg");
  const r = spawnSync(process.execPath, ["scripts/signal.mjs", "--sample", "--out", out], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assertWellFormed(readFileSync(out, "utf8"));
});
