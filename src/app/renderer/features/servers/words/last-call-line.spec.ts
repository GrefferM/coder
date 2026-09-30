import { describe, expect, it } from "vitest";
import { lastCallLine } from "./last-call-line";

describe("lastCallLine", () => {
  it("names the function and the first line of what the server said", () => {
    expect(
      lastCallLine({
        callId: "call-1",
        functionName: "browser_navigate",
        said: "Chromium distribution 'chrome' is not found",
        at: 1_700_000_000_000,
      }),
    ).toBe("browser_navigate · Chromium distribution 'chrome' is not found");
  });

  it("takes the first line alone of an answer that runs on", () => {
    // The row is the beginning of the call card's text, never a retelling.
    expect(
      lastCallLine({
        callId: "call-1",
        functionName: "browser_navigate",
        said: "Chromium distribution 'chrome' is not found\nat /Applications/Google Chrome.app\nRun \"npx playwright install chrome\"",
        at: 1_700_000_000_000,
      }),
    ).toBe("browser_navigate · Chromium distribution 'chrome' is not found");
  });

  it("steps over a heading and shows the sentence under it", () => {
    // A «### Error» heading is not shown as the row's text.
    expect(
      lastCallLine({
        callId: "call-1",
        functionName: "browser_navigate",
        said: "### Error\nError: page.goto: net::ERR_NAME_NOT_RESOLVED at https://ne-isnuye.invalid/\nCall log:",
        at: 1_700_000_000_000,
      }),
    ).toBe("browser_navigate · Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://ne-isnuye.invalid/");
  });

  it("shows the mark itself where the server said nothing else at all, rather than dropping the words", () => {
    expect(
      lastCallLine({
        callId: "call-1",
        functionName: "browser_navigate",
        said: "### Error",
        at: 1_700_000_000_000,
      }),
    ).toBe("browser_navigate · ### Error");
  });

  it("keeps a line that begins as a list, which is a saying and not a mark", () => {
    expect(
      lastCallLine({
        callId: "call-1",
        functionName: "browser_click",
        said: "- ref not found on the page",
        at: 1_700_000_000_000,
      }),
    ).toBe("browser_click · - ref not found on the page");
  });

  it("stands as the name alone where the server said nothing", () => {
    expect(
      lastCallLine({
        callId: "call-1",
        functionName: "browser_navigate",
        said: "",
        at: 1_700_000_000_000,
      }),
    ).toBe("browser_navigate");
  });
});
