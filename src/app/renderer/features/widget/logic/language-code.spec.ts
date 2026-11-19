import { describe, expect, it } from "vitest";
import { languageCode } from "./language-code";

describe("languageCode", () => {
  it("shows a locale by its language alone, in capitals", () => {
    expect(languageCode("en-US")).toBe("EN");
    expect(languageCode("uk-UA")).toBe("UK");
  });
});
