import { readFileSync } from "node:fs";

/** A JPEG file as a data URI, so it can live inside an SVG that GitHub shows as an image. */
export function jpegDataUri(path) {
  return `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
}
