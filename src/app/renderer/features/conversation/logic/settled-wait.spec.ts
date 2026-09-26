import { describe, expect, it } from "vitest";
import { isWaitOver, settledWait } from "./settled-wait";
import type { IncomingWork, WaitedWork } from "../interfaces";

function work(text: string): IncomingWork {
  return {
    text,
    cost: null,
    fromAgentId: "agent-1",
    fromStepIds: [],
    seconds: 3,
    attached: [],
  };
}

function waiting(patch: Partial<WaitedWork> = {}): WaitedWork {
  return {
    startAgentId: "agent-0",
    awaitedIds: ["agent-1", "agent-2"],
    settledIds: [],
    arrived: [],
    viaLinkIds: [],
    isAwaitingRepeat: false,
    ...patch,
  };
}

describe("settledWait", () => {
  it("counts the supplier as settled and keeps what it sent, with the line it came by", () => {
    const stood = settledWait(waiting(), {
      fromId: "agent-1",
      work: work("Тези"),
      via: "link-1",
      isBroken: false,
    });

    expect(stood.settledIds).toEqual(["agent-1"]);
    expect(stood.arrived.map((one) => one.text)).toEqual(["Тези"]);
    expect(stood.viaLinkIds).toEqual(["link-1"]);
  });

  it("counts a supplier that sent nothing as settled all the same", () => {
    // A supplier that said nothing has still had its turn; the point must not hold for it.
    const stood = settledWait(waiting(), {
      fromId: "agent-1",
      work: null,
      via: null,
      isBroken: false,
    });

    expect(stood.settledIds).toEqual(["agent-1"]);
    expect(stood.arrived).toEqual([]);
    expect(stood.viaLinkIds).toEqual([]);
  });

  it("counts one supplier once, however many times its turn is settled", () => {
    const once = settledWait(waiting(), {
      fromId: "agent-1",
      work: null,
      via: null,
      isBroken: false,
    });
    const twice = settledWait(once, {
      fromId: "agent-1",
      work: null,
      via: null,
      isBroken: false,
    });

    expect(twice.settledIds).toEqual(["agent-1"]);
  });

  it("keeps what arrived in the order it came, so the turn reads them that way", () => {
    const first = settledWait(waiting(), {
      fromId: "agent-1",
      work: work("Перше"),
      via: "link-1",
      isBroken: false,
    });
    const second = settledWait(first, {
      fromId: "agent-2",
      work: work("Друге"),
      via: "link-2",
      isBroken: false,
    });

    expect(second.arrived.map((one) => one.text)).toEqual(["Перше", "Друге"]);
    expect(second.viaLinkIds).toEqual(["link-1", "link-2"]);
  });

  it("stands the point on a broken walk, and never takes that back", () => {
    // Once the walk under it broke, the point waits for the repeat and for nothing else.
    const broken = settledWait(waiting(), {
      fromId: "agent-1",
      work: null,
      via: null,
      isBroken: true,
    });
    const after = settledWait(broken, {
      fromId: "agent-2",
      work: work("Друге"),
      via: "link-2",
      isBroken: false,
    });

    expect(broken.isAwaitingRepeat).toBe(true);
    expect(after.isAwaitingRepeat).toBe(true);
  });
});

describe("isWaitOver", () => {
  it("holds while any live supplier has not had its turn", () => {
    expect(
      isWaitOver(
        waiting({
          settledIds: ["agent-1"],
        }),
      ),
    ).toBe(false);
  });

  it("is over once every live supplier has had its turn, answered or not", () => {
    expect(
      isWaitOver(
        waiting({
          settledIds: ["agent-1", "agent-2"],
        }),
      ),
    ).toBe(true);
  });

  it("is never over while the walk under it is broken, however many suppliers have settled", () => {
    expect(
      isWaitOver(
        waiting({
          settledIds: ["agent-1", "agent-2"],
          isAwaitingRepeat: true,
        }),
      ),
    ).toBe(false);
  });

  it("is over at once where nothing is awaited at all", () => {
    expect(
      isWaitOver(
        waiting({
          awaitedIds: [],
        }),
      ),
    ).toBe(true);
  });
});
