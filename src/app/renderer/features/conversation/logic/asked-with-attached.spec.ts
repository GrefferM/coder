import { describe, expect, it } from "vitest";
import { askedWithAttached } from "./asked-with-attached";
import type { PackedAttachment } from "../../../interfaces";

function packed(patch: Partial<PackedAttachment> = {}): PackedAttachment {
  return {
    path: "/a",
    name: "a",
    kind: "file",
    text: "ONE",
    binaries: [],
    ...patch,
  };
}

describe("askedWithAttached", () => {
  it("leaves the words alone where nothing is attached", () => {
    expect(askedWithAttached("питання", [])).toBe("питання");
  });

  it("puts the question first and each attachment's packed block after it", () => {
    const said = askedWithAttached("питання", [
      packed({
        text: "ONE",
      }),
      packed({
        text: "TWO",
      }),
    ]);

    expect(said).toBe("питання\n\nONE\n\nTWO");
  });

  it("sends the packed blocks alone where the question is empty", () => {
    // The field will not let an empty question go, but the pack must not begin with blank lines if one ever does.
    expect(
      askedWithAttached("", [
        packed({
          text: "ONE",
        }),
      ]),
    ).toBe("ONE");
  });
});
