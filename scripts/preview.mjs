// A local stand-in for GitHub's README page, to check the profile before pushing.
//   npm run build && node scripts/signal.mjs --sample && npm run preview
// then open preview/index.html. Toggle light/dark and phone width at the top.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SIGNAL_URL = "https://raw.githubusercontent.com/NickkkGG/NickkkGG/output/signal.svg";

const inline = (s) =>
  s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

/** Just enough markdown for this README: headings, rules, paragraphs, raw HTML blocks. */
export function renderMarkdown(md) {
  return md
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("<")) return block;
      if (block === "---") return "<hr>";
      const h = block.match(/^(#{1,3}) (.*)$/);
      if (h) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
      return `<p>${inline(block)}</p>`;
    })
    .join("\n");
}

const body = renderMarkdown(readFileSync("README.md", "utf8"))
  .replaceAll('src="assets/', 'src="../assets/')
  .replaceAll(SIGNAL_URL, "../dist/signal.svg");

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>NickkkGG profile preview</title>
<style>
  :root { --bg: #0d1117; --fg: #e6edf3; --line: #30363d; --link: #4493f8; --code: rgba(110,118,129,.4); }
  body.light { --bg: #ffffff; --fg: #1f2328; --line: #d1d9e0; --link: #0969da; --code: rgba(129,139,152,.12); }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
  .bar { position: sticky; top: 0; display: flex; gap: 8px; padding: 8px 16px; background: #161b22; z-index: 1; }
  .bar button { font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 6px; border: 1px solid #30363d; background: #21262d; color: #e6edf3; cursor: pointer; }
  .readme { box-sizing: border-box; max-width: 830px; margin: 24px auto; padding: 0 16px; }
  body.phone .readme { max-width: 375px; }
  .readme img { max-width: 100%; box-sizing: content-box; }
  h2 { font-size: 1.5em; border-bottom: 1px solid var(--line); padding-bottom: .3em; margin: 24px 0 16px; }
  h3 { font-size: 1.25em; margin: 24px 0 16px; }
  p { margin: 0 0 16px; }
  a { color: var(--link); text-decoration: none; }
  code { font: 85% ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--code); padding: .2em .4em; border-radius: 6px; }
  hr { height: .25em; border: 0; background: var(--line); margin: 24px 0; }
</style></head>
<body>
<div class="bar"><button onclick="document.body.classList.toggle('light')">light / dark</button><button onclick="document.body.classList.toggle('phone')">phone width</button></div>
<article class="readme">
${body}
</article>
</body></html>
`;

mkdirSync("preview", { recursive: true });
writeFileSync("preview/index.html", page);
console.log("wrote preview/index.html");
