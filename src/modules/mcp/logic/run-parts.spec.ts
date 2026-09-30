import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runParts } from "./run-parts";

describe("runParts", () => {
  it("splits a line into the program and its arguments", () => {
    assert.deepEqual(runParts("npx @modelcontextprotocol/server-filesystem ."), [
      "npx",
      "@modelcontextprotocol/server-filesystem",
      ".",
    ]);
  });

  it("holds a quoted path together, since a folder with a space in its name is ordinary", () => {
    assert.deepEqual(runParts('node "/Users/me/My Servers/index.js"'), ["node", "/Users/me/My Servers/index.js"]);
  });

  it("holds single quotes the same way", () => {
    assert.deepEqual(runParts("node '/Users/me/My Servers/index.js'"), ["node", "/Users/me/My Servers/index.js"]);
  });

  it("passes an empty argument the line deliberately writes as a pair of quotes", () => {
    assert.deepEqual(runParts('server --root ""'), ["server", "--root", ""]);
  });

  it("takes any run of spaces or tabs as one break, and the ends as no break at all", () => {
    assert.deepEqual(runParts("  node   \t server.js  "), ["node", "server.js"]);
  });

  it("gives nothing back for a line that says nothing", () => {
    assert.deepEqual(runParts("   "), []);
  });

  it("holds a quote that opens in the middle of a word, since a value is often written that way", () => {
    assert.deepEqual(runParts('server --root="/My Folder"'), ["server", "--root=/My Folder"]);
  });

  it("reads a quote that is never closed as the character it is, so an apostrophe in a path stands", () => {
    // A line is read as it looks, not refused over a stray quote.
    assert.deepEqual(runParts("node /Users/o'brien/server.js"), ["node", "/Users/o'brien/server.js"]);
  });
});
