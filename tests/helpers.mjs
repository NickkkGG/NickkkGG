import assert from "node:assert/strict";

/** Checks that every opened tag is closed in order. Enough to catch broken SVG strings. */
export function assertWellFormed(svg) {
  const stack = [];
  const body = svg.replace(/<!--[\s\S]*?-->/g, "").replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
  const tag = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(body))) {
    const [, closing, name, , selfClosing] = m;
    if (selfClosing) continue;
    if (closing) {
      const open = stack.pop();
      assert.equal(open, name, `closing </${name}> but <${open}> is open`);
    } else {
      stack.push(name);
    }
  }
  assert.deepEqual(stack, [], `unclosed tags: ${stack.join(", ")}`);
  assert.ok(!/NaN|Infinity|undefined/.test(svg), "svg contains NaN, Infinity or undefined");
}

/** URLs that would make GitHub fetch something from outside the file. */
export function externalUrls(svg) {
  const urls = svg.match(/https?:\/\/[^\s"')<]+/g) ?? [];
  return urls.filter((u) => !u.startsWith("http://www.w3.org/"));
}
