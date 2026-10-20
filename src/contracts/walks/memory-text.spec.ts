import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { memoryText } from "./memory-text";
import { composedSharedMemory } from "./shared-memory";
import type { TurnMemory } from "./turn-memory.interface";

const EMPTY: TurnMemory = {
  thread: [],
  composed: "",
  shared: "",
  covers: 0,
};

describe("memoryText", () => {
  it("is nothing for a memory with nothing in it", () => {
    assert.equal(memoryText(EMPTY), "");
  });

  it("tells each turn of the thread by who said it, in the order they came", () => {
    assert.equal(
      memoryText({
        ...EMPTY,
        thread: [
          {
            from: "person",
            text: "Привіт",
          },
          {
            from: "agent",
            text: "Добрий день",
          },
        ],
      }),
      "ЛЮДИНА:\nПривіт\n\nАГЕНТ:\nДобрий день",
    );
  });

  it("puts the composer's earlier message ahead of the thread", () => {
    const text = memoryText({
      ...EMPTY,
      composed: "ПОПЕРЕДНЯ РОЗМОВА, СТИСЛО:\nстаре\n\n",
      thread: [
        {
          from: "person",
          text: "Нове",
        },
      ],
    });

    assert.equal(text, "ПОПЕРЕДНЯ РОЗМОВА, СТИСЛО:\nстаре\n\nЛЮДИНА:\nНове");
  });

  it("leaves off the shared memory's closing line, which addresses the agent's own turn and not the composer", () => {
    const text = memoryText({
      ...EMPTY,
      shared: composedSharedMemory("факти"),
    });

    assert.ok(text.includes("факти"));
    assert.ok(!text.includes("ТВОЄ ЗАВДАННЯ"));
  });
});
