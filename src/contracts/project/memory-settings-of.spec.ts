import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { memorySettingsOf } from "./memory-settings-of";

describe("memorySettingsOf", () => {
  it("names no numbers for an agent without memory", () => {
    assert.deepEqual(
      memorySettingsOf({
        memory: "none",
      }),
      {
        memory: "none",
      },
    );
  });

  it("keeps the threshold and the target of an agent that keeps a memory, and nothing else of it", () => {
    assert.deepEqual(
      memorySettingsOf({
        ...{
          name: "лишнє",
        },
        memory: "shared",
        compressAt: 70,
        compressTo: 10,
      } as never),
      {
        memory: "shared",
        compressAt: 70,
        compressTo: 10,
      },
    );
  });
});
