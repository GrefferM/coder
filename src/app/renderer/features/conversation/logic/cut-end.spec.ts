import { describe, expect, it } from "vitest";
import { cutEnd } from "./cut-end";
import { answerCeilingNote, callsExhaustedNote } from "../words";
import { CHAT_SAID_NOTHING_NOTE, CHAT_STOPPED_NOTE } from "../constants";
import { RUN_STEP_CALLS, RUN_STEP_CEILING, RUN_STEP_SILENT, RUN_STEP_STOPPED } from "../../record";
import type { SaidTurn } from "../interfaces";

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
    expect(cutEnd(said(), 8, 4096)).toBeNull();
  });

  it("gives each of the four ways its own words and its own end", () => {
    expect(
      cutEnd(
        said({
          isStopped: true,
        }),
        8,
        4096,
      ),
    ).toEqual({
      note: CHAT_STOPPED_NOTE,
      state: RUN_STEP_STOPPED,
    });
    expect(
      cutEnd(
        said({
          isCeilingHit: true,
        }),
        8,
        4096,
      ),
    ).toEqual({
      note: answerCeilingNote(4096),
      state: RUN_STEP_CEILING,
    });
    expect(
      cutEnd(
        said({
          text: "",
        }),
        8,
        4096,
      ),
    ).toEqual({
      note: CHAT_SAID_NOTHING_NOTE,
      state: RUN_STEP_SILENT,
    });
  });

  it("names the person's own number where the ceiling on calls is what stopped it", () => {
    expect(
      cutEnd(
        said({
          isCallsExhausted: true,
        }),
        12,
        4096,
      ),
    ).toEqual({
      note: callsExhaustedNote(12),
      state: RUN_STEP_CALLS,
    });
  });

  it("counts words that are only spacing as nothing said", () => {
    expect(
      cutEnd(
        said({
          text: "   \n  ",
        }),
        8,
        4096,
      )?.state,
    ).toBe(RUN_STEP_SILENT);
  });

  it("says «stopped» before anything else, since a person's hand ends the turn whatever it had done", () => {
    // A stopped turn may also have run out of calls; what the record must say is that it was stopped.
    expect(
      cutEnd(
        said({
          isStopped: true,
          isCallsExhausted: true,
          text: "",
        }),
        8,
        4096,
      ),
    ).toEqual({
      note: CHAT_STOPPED_NOTE,
      state: RUN_STEP_STOPPED,
    });
  });
});
