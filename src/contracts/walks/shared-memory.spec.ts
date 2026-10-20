import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composedSharedMemory, sharedMemoryBlock, sharedMemoryText, sharedMemoryWithTask } from "./shared-memory";
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
      ].join("\n\n"),
    );
  });
});

describe("sharedMemoryText", () => {
  it("opens with what the memory is and tells the blocks after it in order, with no task", () => {
    assert.equal(sharedMemoryText(["один", "два"]), [SHARED_MEMORY_OPENING, "один", "два"].join("\n\n"));
  });
});

describe("sharedMemoryWithTask", () => {
  it("closes the memory on the task a turn's own words follow", () => {
    assert.equal(sharedMemoryWithTask("ПАМ'ЯТЬ"), `ПАМ'ЯТЬ\n\n${SHARED_MEMORY_TASK}`);
  });
});
