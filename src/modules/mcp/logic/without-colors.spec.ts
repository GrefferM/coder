import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withoutColors } from "./without-colors";

/** The escape character terminal colours begin with; built so no control character stands in the source. */
const ESCAPE = String.fromCharCode(27);

describe("withoutColors", () => {
  it("takes the terminal's paint off a server's answer", () => {
    // Playwright's call log comes through painted; «[2m» is not a word it said.
    assert.equal(
      withoutColors(`${ESCAPE}[2m  - navigating to "https://example.com/"${ESCAPE}[22m`),
      '  - navigating to "https://example.com/"',
    );
  });

  it("leaves everything that is not paint exactly as it stands", () => {
    const said = "### Error\nError: net::ERR_NAME_NOT_RESOLVED at https://example/\n\n- [ref=e3] «Learn more»";

    assert.equal(withoutColors(said), said);
  });

  it("takes off a whole answer's worth of colours without touching its lines", () => {
    assert.equal(
      withoutColors(`${ESCAPE}[31mError${ESCAPE}[39m\n${ESCAPE}[2mCall log:${ESCAPE}[22m\n  waiting`),
      "Error\nCall log:\n  waiting",
    );
  });

  it("says nothing of an answer that carried no paint at all", () => {
    assert.equal(withoutColors(""), "");
  });
});
