import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cutEnd } from "./cut-end";
import {
  answerCeilingNote,
  callsExhaustedNote,
  CHAT_SAID_NOTHING_NOTE,
  CHAT_STOPPED_NOTE,
  RUN_STEP_CALLS,
  RUN_STEP_CEILING,
  RUN_STEP_SILENT,
  RUN_STEP_STOPPED,
} from "../../../contracts";
import type { SaidTurn } from "../../../contracts";

function said(patch: Partial<SaidTurn> = {}): SaidTurn {
  return {
    text: "- Починай з малого",
    isStopped: false,
    isCallsExhausted: false,
    isCeilingHit: false,
    inputTokens: 400,
    outputTokens: 200,
    calls: [],
    ...patch,
  };
}

describe("cutEnd", () => {
  it("says nothing about a turn that said its piece — the agent's own words stand instead", () => {
    assert.equal(cutEnd(said(), 8, 4096), null);
  });

  it("gives each of the four ways its own words and its own end", () => {
    assert.deepEqual(
      cutEnd(
        said({
          isStopped: true,
        }),
        8,
        4096,
      ),
      {
        note: CHAT_STOPPED_NOTE,
        state: RUN_STEP_STOPPED,
      },
    );
    assert.deepEqual(
      cutEnd(
        said({
          isCeilingHit: true,
        }),
        8,
        4096,
      ),
      {
        note: answerCeilingNote(4096),
        state: RUN_STEP_CEILING,
      },
    );
    assert.deepEqual(
      cutEnd(
        said({
          text: "",
        }),
        8,
        4096,
      ),
      {
        note: CHAT_SAID_NOTHING_NOTE,
        state: RUN_STEP_SILENT,
      },
    );
  });

  it("names the person's own number where the ceiling on calls is what stopped it", () => {
    assert.deepEqual(
      cutEnd(
        said({
          isCallsExhausted: true,
        }),
        12,
        4096,
      ),
      {
        note: callsExhaustedNote(12),
        state: RUN_STEP_CALLS,
      },
    );
  });

  it("counts words that are only spacing as nothing said", () => {
    assert.equal(
      cutEnd(
        said({
          text: "   \n  ",
        }),
        8,
        4096,
      )?.state,
      RUN_STEP_SILENT,
    );
  });

  it("says «stopped» before anything else, since a person's hand ends the turn whatever it had done", () => {
    // A stopped turn may also have run out of calls; the record says stopped.
    assert.deepEqual(
      cutEnd(
        said({
          isStopped: true,
          isCallsExhausted: true,
          text: "",
        }),
        8,
        4096,
      ),
      {
        note: CHAT_STOPPED_NOTE,
        state: RUN_STEP_STOPPED,
      },
    );
  });
});
