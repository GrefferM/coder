import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { askedWithAttached } from "./asked-with-attached";
import type { PackedAttachment } from "./packed-attachment.interface";

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
    assert.equal(askedWithAttached("питання", []), "питання");
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

    assert.equal(said, "питання\n\nONE\n\nTWO");
  });

  it("sends the packed blocks alone where the question is empty", () => {
    // An empty question must not make the pack begin with blank lines.
    assert.equal(
      askedWithAttached("", [
        packed({
          text: "ONE",
        }),
      ]),
      "ONE",
    );
  });
});
