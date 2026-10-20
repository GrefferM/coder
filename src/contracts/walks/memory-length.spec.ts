import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composedMemory } from "./composed-memory";
import { memoryLength } from "./memory-length";

describe("memoryLength", () => {
  it("counts the thread, the shared memory and the composer's message, as the ceiling counts them", () => {
    assert.equal(
      memoryLength({
        thread: [
          {
            from: "person",
            text: "абв",
          },
          {
            from: "agent",
            text: "де",
          },
        ],
        composed: "жз",
        shared: "и",
        covers: 0,
      }),
      8,
    );
  });

  it("counts the composer's message as it is told, with its opening and its gap", () => {
    const told = composedMemory("Зміст");

    assert.equal(
      memoryLength({
        thread: [],
        composed: told,
        shared: "",
        covers: 0,
      }),
      [...told].length,
    );
    assert.ok([...told].length > [..."Зміст"].length);
  });
});

describe("composedMemory", () => {
  it("says nothing of a memory that was never compressed", () => {
    assert.equal(composedMemory(null), "");
  });

  it("opens with what it is and ends with a gap before what follows", () => {
    const told = composedMemory("Зміст");

    assert.ok(told.startsWith("ПОПЕРЕДНЯ РОЗМОВА, СТИСЛО"));
    assert.ok(told.includes("Зміст"));
    assert.ok(told.endsWith("\n\n"));
  });
});
