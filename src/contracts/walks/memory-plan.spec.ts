import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { memoryPlan, memoryReserve, memoryThreshold } from "./memory-plan";
import { turnLength } from "./turn-length";
import { anAgent } from "../testing";
import type { FilledAgent } from "../project";
import type { MemoryPlan } from "./memory-plan.interface";

const CEILING = 1_000;

/** A kept-memory agent that compresses at 90 % down to 10 %, unless a spec says otherwise. */
function agent(patch: Partial<FilledAgent> = {}): FilledAgent {
  return <FilledAgent>anAgent({
    compressAt: 90,
    compressTo: 10,
    ...patch,
  });
}

function plan(parts: { prompt?: number; asked?: number; memory?: number }, who: FilledAgent = agent()): MemoryPlan {
  return memoryPlan(
    who,
    turnLength({
      systemPrompt: "а".repeat(parts.prompt ?? 0),
      asked: "б".repeat(parts.asked ?? 0),
      memoryLength: parts.memory ?? 0,
      ceiling: CEILING,
    }),
  );
}

describe("memoryReserve", () => {
  it("is the target's share of the ceiling", () => {
    assert.equal(memoryReserve(10, 1_000), 100);
    assert.equal(memoryReserve(30, 1_000), 300);
  });

  it("rounds up, so the reserve is never written down short", () => {
    assert.equal(memoryReserve(15, 999), 150);
    assert.equal(memoryReserve(10, 1), 1);
  });
});

describe("memoryThreshold", () => {
  it("is the threshold's share of the ceiling, rounded up", () => {
    assert.equal(memoryThreshold(90, 1_000), 900);
    assert.equal(memoryThreshold(70, 999), 700);
  });
});

describe("memoryPlan", () => {
  it("lets a turn below the threshold go as it stands", () => {
    assert.deepEqual(
      plan({
        prompt: 100,
        asked: 100,
        memory: 699,
      }),
      {
        kind: "go",
      },
    );
  });

  it("compresses once the turn reaches the threshold, down to the target's share of the ceiling", () => {
    assert.deepEqual(
      plan({
        prompt: 100,
        asked: 100,
        memory: 700,
      }),
      {
        kind: "compress",
        budget: 100,
        at: 90,
        to: 10,
      },
    );
  });

  it("keeps the threshold at the exact edge: 900 of 1000 is 90 percent, and compresses", () => {
    assert.equal(
      plan({
        asked: 100,
        memory: 800,
      }).kind,
      "compress",
    );
    assert.equal(
      plan({
        asked: 100,
        memory: 799,
      }).kind,
      "go",
    );
  });

  it("follows the threshold and the target the agent has written", () => {
    const eager = agent({
      compressAt: 70,
      compressTo: 30,
    });

    assert.deepEqual(
      plan(
        {
          asked: 100,
          memory: 600,
        },
        eager,
      ),
      {
        kind: "compress",
        budget: 300,
        at: 70,
        to: 30,
      },
    );
    assert.equal(
      plan(
        {
          asked: 100,
          memory: 599,
        },
        eager,
      ).kind,
      "go",
    );
  });

  it("compresses a memory that fills the rest of the ceiling when the person's words are 40 percent of it", () => {
    assert.deepEqual(
      plan(
        {
          asked: 400,
          memory: 600,
        },
        agent({
          compressAt: 70,
        }),
      ),
      {
        kind: "compress",
        budget: 100,
        at: 70,
        to: 10,
      },
    );
  });

  it("lets the words go up to the threshold less the target, and not a character more: 80 of 100 at 90 and 10", () => {
    assert.deepEqual(
      plan({
        asked: 799,
      }),
      {
        kind: "go",
      },
    );
    assert.deepEqual(
      plan({
        asked: 800,
      }),
      {
        kind: "wall",
        reserve: 100,
        limit: 900,
      },
    );
  });

  it("leaves 39.99 percent to the words at a target of 30 and a threshold of 70", () => {
    const tight = agent({
      compressAt: 70,
      compressTo: 30,
    });

    assert.equal(
      plan(
        {
          asked: 399,
        },
        tight,
      ).kind,
      "go",
    );
    assert.deepEqual(
      plan(
        {
          asked: 400,
        },
        tight,
      ),
      {
        kind: "wall",
        reserve: 300,
        limit: 700,
      },
    );
  });

  it("counts the system prompt with the question against what is left", () => {
    assert.equal(
      plan({
        prompt: 500,
        asked: 299,
      }).kind,
      "go",
    );
    assert.deepEqual(
      plan({
        prompt: 500,
        asked: 300,
      }),
      {
        kind: "wall",
        reserve: 100,
        limit: 900,
      },
    );
  });

  it("holds back the share the agent wrote: at 90 and 30 the words get 60", () => {
    const wide = agent({
      compressTo: 30,
    });

    assert.equal(
      plan(
        {
          asked: 599,
        },
        wide,
      ).kind,
      "go",
    );
    assert.deepEqual(
      plan(
        {
          asked: 600,
        },
        wide,
      ),
      {
        kind: "wall",
        reserve: 300,
        limit: 900,
      },
    );
  });

  it("compresses into the whole reserve however much the words took of the rest", () => {
    assert.deepEqual(
      plan({
        asked: 799,
        memory: 500,
      }),
      {
        kind: "compress",
        budget: 100,
        at: 90,
        to: 10,
      },
    );
  });

  it("never compresses again a memory just written down: the words and the target stay under the threshold", () => {
    // 799 of words and the whole 100 of target is 899, one under the threshold of 900.
    assert.equal(
      plan({
        asked: 799,
        memory: 100,
      }).kind,
      "go",
    );
  });

  it("names the turn's own words when they and the memory are both too long", () => {
    assert.deepEqual(
      plan({
        asked: 1_001,
        memory: 2_000,
      }),
      {
        kind: "wall",
        reserve: 100,
        limit: 900,
      },
    );
  });

  it("does not let any memory, however long, be a wall of its own", () => {
    assert.equal(
      plan({
        asked: 10,
        memory: 1_000_000,
      }).kind,
      "compress",
    );
  });

  it("does not compress an agent whose memory is off, holds nothing back, and keeps the old wall for it", () => {
    const none = agent({
      memory: "none",
    });

    assert.deepEqual(
      plan(
        {
          asked: 100,
          memory: 850,
        },
        none,
      ),
      {
        kind: "go",
      },
    );
    assert.deepEqual(
      plan(
        {
          asked: 1_000,
        },
        none,
      ),
      {
        kind: "go",
      },
    );
    assert.deepEqual(
      plan(
        {
          asked: 100,
          memory: 901,
        },
        none,
      ),
      {
        kind: "wall",
        reserve: 0,
        limit: 1_000,
      },
    );
  });
});
