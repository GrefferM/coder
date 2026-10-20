import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { composedOutcome, composerAsk, composerBudget } from "./composer-turn";
import { composedMemory } from "./composed-memory";
import { composerLength, composerMessage } from "./composer-words";
import { COMPOSER_MEMORY_OPENING, COMPOSER_SAID_NOTHING_NOTE } from "./composer-words.constant";
import { composedSharedMemory } from "./shared-memory";
import type { TurnMemory } from "./turn-memory.interface";

const MEMORY: TurnMemory = {
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
  composed: "",
  shared: "",
  covers: 4,
};

describe("composerBudget", () => {
  it("leaves what the budget has once the words that tell an own memory are taken from it", () => {
    assert.equal(composerBudget("own", 1_000), 1_000 - [...composedMemory("")].length);
  });

  it("takes the longer words a shared memory is told in from it", () => {
    assert.equal(composerBudget("shared", 1_000), 1_000 - [...composedSharedMemory("")].length);
  });

  it("never leaves less than one character", () => {
    assert.equal(composerBudget("own", 1), 1);
  });
});

describe("composerAsk", () => {
  it("is one message from the person: the memory told by who said it, then the instruction", () => {
    const [asked, ...rest] = composerAsk(MEMORY, 100_000, 1_000);

    assert.equal(rest.length, 0);
    assert.equal(asked.from, "person");
    assert.equal(asked.text, composerMessage("ЛЮДИНА:\nПривіт\n\nАГЕНТ:\nДобрий день", 1_000));
  });

  it("reads a memory too long for the ceiling from its end, in the room the ceiling leaves it", () => {
    const [asked] = composerAsk(
      {
        ...MEMORY,
        thread: [
          {
            from: "person",
            text: "б".repeat(50_000),
          },
        ],
      },
      10_000,
      700,
    );

    assert.ok(asked.text.startsWith(`${COMPOSER_MEMORY_OPENING}${"б".repeat(10_000 - composerLength(10_000))}`));
  });
});

describe("composedOutcome", () => {
  it("tells an own memory ahead of the thread, which the turn then goes without", () => {
    const outcome = composedOutcome("Зміст", 100, "own", 4);

    assert.equal(outcome.text, "Зміст");
    assert.deepEqual(outcome.memory, {
      thread: [],
      composed: composedMemory("Зміст"),
      shared: "",
      covers: 4,
    });
  });

  it("tells a shared memory in its own words", () => {
    const outcome = composedOutcome("Зміст", 100, "shared", 7);

    assert.equal(outcome.memory.shared, composedSharedMemory("Зміст"));
    assert.equal(outcome.memory.composed, "");
    assert.equal(outcome.memory.covers, 7);
  });

  it("cuts the end off what runs over the budget", () => {
    assert.equal(composedOutcome("один два три", 8, "own", 1).text, "один два");
  });

  it("is an error where nothing was written, since the memory cannot be dropped for it", () => {
    assert.throws(() => composedOutcome("  ", 100, "own", 1), new Error(COMPOSER_SAID_NOTHING_NOTE));
  });
});
