// Draws signal.svg. In the daily workflow it reads live data with the workflow's token;
// `--sample` draws from the test fixtures for local previews.
//
//   node scripts/signal.mjs --login NickkkGG --out dist/signal.svg
//   node scripts/signal.mjs --sample --out dist/signal.svg

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { fetchSignalData, lastPushRepo, parseCalendar } from "./signal/contrib.mjs";
import { renderSignal } from "./signal/render.mjs";

const { values: args } = parseArgs({
  options: {
    login: { type: "string", default: "NickkkGG" },
    out: { type: "string", default: "dist/signal.svg" },
    sample: { type: "boolean", default: false },
  },
});

function sampleData() {
  const fixture = (name) => JSON.parse(readFileSync(new URL(`../tests/fixtures/${name}`, import.meta.url)));
  const { weeks, total } = parseCalendar(fixture("calendar.json"));
  return { weeks, total, bestWeek: Math.max(...weeks), lastPush: lastPushRepo(fixture("events.json")), updated: new Date().toISOString().slice(0, 10) };
}

try {
  const data = args.sample ? sampleData() : await fetchSignalData(args.login, process.env.GITHUB_TOKEN);
  const svg = renderSignal(data);
  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, svg);
  console.log(`wrote ${args.out}: ${data.total} contributions, best week ${data.bestWeek}, last push ${data.lastPush ?? "-"}`);
} catch (err) {
  console.error(`signal: ${err.message}`);
  process.exitCode = 1;
}
