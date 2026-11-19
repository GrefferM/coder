import { describe, expect, it } from "vitest";
import { localeLabel } from "./locale-label";

describe("localeLabel", () => {
  it("names a locale by its language in Ukrainian, then its code", () => {
    expect(localeLabel("en-US")).toBe("Англійська · en-US");
    expect(localeLabel("uk-UA")).toBe("Українська · uk-UA");
  });
});
