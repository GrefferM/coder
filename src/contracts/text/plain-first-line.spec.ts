import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plainFirstLine } from "./plain-first-line";
import { FAILURE_MARKUP } from "./failure-words.constant";

describe("plainFirstLine", () => {
  it("squeezes a sentence printed over several lines into one", () => {
    assert.equal(plainFirstLine("Error: no\n   route  to host", FAILURE_MARKUP), "Error: no route to host");
  });

  it("stops where the markup begins, since a page buries the line that said what went wrong", () => {
    assert.equal(plainFirstLine("Oops <html><body>…</body></html>", FAILURE_MARKUP), "Oops");
  });

  it("takes the whole of it where markup stands from the first character: better long than empty", () => {
    assert.equal(plainFirstLine("<html><body>Oops</body></html>", FAILURE_MARKUP), "<html><body>Oops</body></html>");
  });

  it("says nothing of nothing", () => {
    assert.equal(plainFirstLine("", FAILURE_MARKUP), "");
  });
});
