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
    // An agent carries more than its memory; none of the rest is handed on.
    const agent = {
      name: "Архіваріус",
      maxCalls: 4,
      memory: "shared" as const,
      compressAt: 70,
      compressTo: 10,
    };

    assert.deepEqual(memorySettingsOf(agent), {
      memory: "shared",
      compressAt: 70,
      compressTo: 10,
    });
  });
});
