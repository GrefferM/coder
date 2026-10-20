import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { turnMessages } from "./turn-messages";
import type { TurnMemory } from "./turn-memory.interface";

function memory(patch: Partial<TurnMemory> = {}): TurnMemory {
  return {
    thread: [],
    composed: "",
    shared: "",
    covers: 0,
    ...patch,
  };
}

describe("turnMessages", () => {
  it("gives the turn's words alone to an agent with no memory", () => {
    assert.deepEqual(turnMessages(memory(), "Питання"), [
      {
        from: "person",
        text: "Питання",
      },
    ]);
  });

  it("puts the thread ahead of the turn's words, and the shared memory at the head of them", () => {
    assert.deepEqual(
      turnMessages(
        memory({
          thread: [
            {
              from: "person",
              text: "було",
            },
            {
              from: "agent",
              text: "відповів",
            },
          ],
          shared: "ПАМ'ЯТЬ\n",
          covers: 0,
        }),
        "Питання",
      ),
      [
        {
          from: "person",
          text: "було",
        },
        {
          from: "agent",
          text: "відповів",
        },
        {
          from: "person",
          text: "ПАМ'ЯТЬ\n\n\nТВОЄ ЗАВДАННЯ:\nПитання",
        },
      ],
    );
  });

  it("opens the first thing the model reads with the composer's message, so no two inputs stand side by side", () => {
    assert.deepEqual(
      turnMessages(
        memory({
          thread: [
            {
              from: "person",
              text: "було",
            },
            {
              from: "agent",
              text: "відповів",
            },
          ],
          composed: "ЗМІСТ\n\n",
        }),
        "Питання",
      ),
      [
        {
          from: "person",
          text: "ЗМІСТ\n\nбуло",
        },
        {
          from: "agent",
          text: "відповів",
        },
        {
          from: "person",
          text: "Питання",
        },
      ],
    );
  });

  it("opens the turn's own words with it where nothing came after the compression", () => {
    assert.deepEqual(
      turnMessages(
        memory({
          composed: "ЗМІСТ\n\n",
        }),
        "Питання",
      ),
      [
        {
          from: "person",
          text: "ЗМІСТ\n\nПитання",
        },
      ],
    );
  });
});
