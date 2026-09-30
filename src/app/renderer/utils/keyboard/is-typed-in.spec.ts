import { describe, expect, it } from "vitest";
import { isTypedIn } from "./is-typed-in";

describe("isTypedIn", () => {
  it("claims the fields text is typed into, and nothing else", () => {
    expect(isTypedIn(document.createElement("input"))).toBe(true);
    expect(isTypedIn(document.createElement("textarea"))).toBe(true);
    expect(isTypedIn(document.createElement("button"))).toBe(false);
    expect(isTypedIn(null)).toBe(false);
  });

  it("claims an editable block the way it claims a field", () => {
    const block = document.createElement("div");

    // jsdom leaves `isContentEditable` undefined; set it as the browser would.
    Object.defineProperty(block, "isContentEditable", {
      value: true,
    });

    expect(isTypedIn(block)).toBe(true);
  });
});
