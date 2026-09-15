import { describe, expect, it } from "vitest";
import { templateParts } from "./template-parts";

describe("templateParts", () => {
  it("has nothing to split in an empty line", () => {
    expect(templateParts("")).toEqual([]);
  });

  it("leaves a line without braces whole", () => {
    expect(templateParts("npm test")).toEqual([
      {
        text: "npm test",
        isSlot: false,
      },
    ]);
  });

  it("marks what braces stand in for, and keeps the spaces around it", () => {
    expect(templateParts("npm test -- {pattern}")).toEqual([
      {
        text: "npm test -- ",
        isSlot: false,
      },
      {
        text: "{pattern}",
        isSlot: true,
      },
    ]);
  });

  it("takes several slots, and whatever stands between them", () => {
    expect(templateParts("{a} and {b}!")).toEqual([
      {
        text: "{a}",
        isSlot: true,
      },
      {
        text: " and ",
        isSlot: false,
      },
      {
        text: "{b}",
        isSlot: true,
      },
      {
        text: "!",
        isSlot: false,
      },
    ]);
  });

  it("reads every brace as a part, whatever stands inside it", () => {
    expect(templateParts("awk '{print $5}'")).toEqual([
      {
        text: "awk '",
        isSlot: false,
      },
      {
        text: "{print $5}",
        isSlot: true,
      },
      {
        text: "'",
        isSlot: false,
      },
    ]);
  });

  it("puts every character back, which is what keeps the caret where it belongs", () => {
    const line = "  npm run {task} -- {flag}  ";

    expect(
      templateParts(line)
        .map((part) => part.text)
        .join(""),
    ).toBe(line);
  });
});
