import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compressionOf } from "./compression-of";

describe("compressionOf", () => {
  it("reads the threshold and the target the agent had then, not what it has now", () => {
    assert.deepEqual(
      compressionOf({
        compressAt: 70,
        compressTo: 30,
      }),
      {
        at: 70,
        to: 30,
      },
    );
  });
});
