import { describe, expect, it } from "vitest";
import { plainFirstLine } from "./plain-first-line";
import { FAILURE_MARKUP } from "../../constants";

describe("plainFirstLine", () => {
  it("squeezes a sentence printed over several lines into one", () => {
    expect(plainFirstLine("Error: no\n   route  to host", FAILURE_MARKUP)).toBe("Error: no route to host");
  });

  it("stops where the markup begins, since a page buries the line that said what went wrong", () => {
    expect(plainFirstLine("Oops <html><body>…</body></html>", FAILURE_MARKUP)).toBe("Oops");
  });

  it("takes the whole of it where markup stands from the first character: better long than empty", () => {
    expect(plainFirstLine("<html><body>Oops</body></html>", FAILURE_MARKUP)).toBe("<html><body>Oops</body></html>");
  });

  it("says nothing of nothing", () => {
    expect(plainFirstLine("", FAILURE_MARKUP)).toBe("");
  });
});
