import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWaitOver, missingSuppliers, settledWait } from "./settled-wait";
import type { IncomingWork, WaitedWork } from "../../../contracts";

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
    isSilent: false,
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

    assert.deepEqual(stood.settledIds, ["agent-1"]);
    assert.deepEqual(
      stood.arrived.map((one) => one.text),
      ["Тези"],
    );
    assert.deepEqual(stood.viaLinkIds, ["link-1"]);
  });

  it("counts a supplier that sent nothing as settled all the same", () => {
    // A supplier that said nothing has still had its turn; the point does not hold for it.
    const stood = settledWait(waiting(), {
      fromId: "agent-1",
      work: null,
      via: null,
      isBroken: false,
    });

    assert.deepEqual(stood.settledIds, ["agent-1"]);
    assert.deepEqual(stood.arrived, []);
    assert.deepEqual(stood.viaLinkIds, []);
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

    assert.deepEqual(twice.settledIds, ["agent-1"]);
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

    assert.deepEqual(
      second.arrived.map((one) => one.text),
      ["Перше", "Друге"],
    );
    assert.deepEqual(second.viaLinkIds, ["link-1", "link-2"]);
  });

  it("stands the point on a broken walk, and never takes that back", () => {
    // After the walk under it broke, the point waits only for the repeat.
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

    assert.equal(broken.isAwaitingRepeat, true);
    assert.equal(after.isAwaitingRepeat, true);
  });
});

describe("isWaitOver", () => {
  it("holds while any live supplier has not had its turn", () => {
    assert.equal(
      isWaitOver(
        waiting({
          settledIds: ["agent-1"],
        }),
      ),
      false,
    );
  });

  it("is over once every live supplier has had its turn, answered or not", () => {
    assert.equal(
      isWaitOver(
        waiting({
          settledIds: ["agent-1", "agent-2"],
        }),
      ),
      true,
    );
  });

  it("is never over while the walk under it is broken, however many suppliers have settled", () => {
    assert.equal(
      isWaitOver(
        waiting({
          settledIds: ["agent-1", "agent-2"],
          isAwaitingRepeat: true,
        }),
      ),
      false,
    );
  });

  it("is over at once where nothing is awaited at all", () => {
    assert.equal(
      isWaitOver(
        waiting({
          awaitedIds: [],
        }),
      ),
      true,
    );
  });
});

describe("missingSuppliers", () => {
  it("counts the awaited suppliers whose work did not arrive", () => {
    assert.equal(
      missingSuppliers(
        waiting({
          settledIds: ["agent-1", "agent-2"],
          arrived: [work("Готово.")],
        }),
      ),
      1,
    );
  });

  it("counts none when every awaited supplier gave work", () => {
    assert.equal(
      missingSuppliers(
        waiting({
          settledIds: ["agent-1", "agent-2"],
          arrived: [
            work("Готово."),
            {
              ...work("Теж."),
              fromAgentId: "agent-2",
            },
          ],
        }),
      ),
      0,
    );
  });
});
