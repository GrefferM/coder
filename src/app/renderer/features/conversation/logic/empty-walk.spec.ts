import { describe, expect, it } from "vitest";
import { emptyWalk } from "./empty-walk";

describe("emptyWalk", () => {
  it("is empty in every part a stream can hold", () => {
    // This is what «+ НОВИЙ ЧАТ» comes back to — nothing out, nothing walked, nothing aimed at.
    const state = emptyWalk();

    expect(state.out).toEqual({});
    expect(state.walks).toEqual({});
    expect(state.ledgers).toEqual({});
    expect(state.saidAgain).toEqual([]);
    expect(state.drafts).toEqual({});
    expect(state.attachments).toEqual({});
    expect(state.aimedAgentId).toBeNull();
    expect(state.flowRunId).toBeNull();
  });

  it("gives a fresh state each time and never the same one twice", () => {
    // A stream emptied twice must not find in the second what was written into the first.
    const first = emptyWalk();
    const second = emptyWalk();

    first.saidAgain.push("turn-1");
    first.drafts["agent-1"] = "недописане";
    first.attachments["agent-1"] = [];
    first.aimedAgentId = "agent-1";

    expect(second.saidAgain).toEqual([]);
    expect(second.drafts).toEqual({});
    expect(second.attachments).toEqual({});
    expect(second.aimedAgentId).toBeNull();
  });
});
