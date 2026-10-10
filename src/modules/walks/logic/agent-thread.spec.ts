import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentThread } from "./agent-thread";
import { RUN_STEP_CEILING, RUN_STEP_FAILED } from "../../../contracts";
import { aStep, anAgent } from "../../../utils/testing";

describe("agentThread", () => {
  it("makes a pair of a step that answered, and none of a step that did not", () => {
    // Three turns of one agent: answered, cut by the ceiling, fell; only the first is a pair.
    const thread = agentThread(
      [
        aStep({
          id: "step-1",
          place: 1,
          asked: "Розбий текст на тези",
          said: "- Починай з малого",
        }),
        aStep({
          id: "step-2",
          place: 2,
          state: RUN_STEP_CEILING,
          asked: "Розгорни першу",
          said: "Починати варто з",
        }),
        aStep({
          id: "step-3",
          place: 3,
          state: RUN_STEP_FAILED,
          asked: "Ще раз",
          said: "",
        }),
      ],
      anAgent(),
    );

    assert.deepEqual(thread, [
      {
        from: "person",
        text: "Розбий текст на тези",
      },
      {
        from: "agent",
        text: "- Починай з малого",
      },
    ]);
  });

  it("holds only this agent's own turns, in the order the record kept them", () => {
    const thread = agentThread(
      [
        aStep({
          id: "step-2",
          place: 2,
          agentId: "agent-1",
          asked: "друге",
          said: "два",
        }),
        aStep({
          id: "step-1",
          place: 1,
          agentId: "agent-1",
          asked: "перше",
          said: "один",
        }),
        aStep({
          id: "step-3",
          place: 3,
          agentId: "agent-2",
          asked: "чуже",
          said: "не моє",
        }),
      ],
      anAgent(),
    );

    assert.deepEqual(
      thread.map((turn) => turn.text),
      ["перше", "один", "друге", "два"],
    );
  });

  it("gives an agent whose memory is not its own nothing behind it, however much it answered", () => {
    assert.deepEqual(
      agentThread(
        [
          aStep({
            asked: "Розбий текст на тези",
            said: "- Починай з малого",
          }),
        ],
        anAgent({
          memory: "none",
        }),
      ),
      [],
    );
  });

  it("gives an agent asked here for the first time nothing behind it", () => {
    assert.deepEqual(
      agentThread(
        [
          aStep({
            agentId: "agent-2",
          }),
        ],
        anAgent(),
      ),
      [],
    );
  });
});
