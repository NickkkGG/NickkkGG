// Renders every static panel of the profile into assets/.
//   npm run build

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { renderHeader } from "./scenes/header.mjs";
import { BUTTONS, renderButton } from "./scenes/buttons.mjs";
import { renderIntroTv } from "./scenes/intro.mjs";
import { CHANNELS, renderChannel } from "./scenes/channels.mjs";
import { renderSystem } from "./scenes/system.mjs";
import { renderFooter } from "./scenes/footer.mjs";

/** Writes all panels into `outDir` and returns their paths. */
export async function buildAll(outDir = "assets") {
  mkdirSync(outDir, { recursive: true });
  const panels = [
    ["header.svg", renderHeader()],
    ...BUTTONS.map((b) => [b.file, renderButton(b.label)]),
    ["intro-tv.svg", renderIntroTv()],
    ...CHANNELS.map((c) => [c.file, renderChannel(c)]),
    ["system-check.svg", renderSystem()],
    ["footer.svg", renderFooter()],
  ];
  return panels.map(([name, svg]) => {
    const path = join(outDir, name);
    writeFileSync(path, svg);
    return path;
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = await buildAll();
  console.log(`built ${files.length} panels:\n  ${files.join("\n  ")}`);
}
