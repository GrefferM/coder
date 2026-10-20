import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composedSharedMemory, sharedMemoryBlock } from "./shared-memory";
import { SHARED_MEMORY_OPENING, SHARED_MEMORY_TASK } from "./shared-memory.constant";

describe("sharedMemoryBlock", () => {
  it("puts the heading on one line and its words under it", () => {
    assert.equal(sharedMemoryBlock("ЗАГОЛОВОК:", "слова"), "ЗАГОЛОВОК:\nслова");
  });
});

describe("composedSharedMemory", () => {
  it("tells a question compressed into one message the way the record tells it, with nothing after", () => {
    assert.equal(
      composedSharedMemory("Знайдено report.md"),
      [
        SHARED_MEMORY_OPENING,
        "ПОПЕРЕДНЄ, СТИСЛО (питання людини і відповіді до цього моменту):\nЗнайдено report.md",
        SHARED_MEMORY_TASK,
      ].join("\n\n"),
    );
  });
});
