import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import { walkMachine } from "./walk-machine";
import {
  RECORD_UNCLOSED_NOTE,
  RECORD_UNREAD_NOTE,
  RECORD_UNSAVED_NOTE,
  RUN_STEP_DONE,
  RUN_STEP_FAILED,
  isWalking,
} from "../../../contracts";
import type {
  Agent,
  Link,
  PackedAttachment,
  ProjectConfig,
  RunUnfinished,
  ChatMessage,
  IncomingWork,
  RunLedger,
  TurnAnswer,
  TurnOut,
  WaitedWork,
  Walk,
  WalkEffect,
  WalkEvent,
  WalkState,
} from "../../../contracts";
import { aConfig, anAgent } from "../../../utils/testing";

/** A file sent with a question, packed as it went into the turn. */
const NOTES: PackedAttachment = {
  path: "/tmp/notes.md",
  name: "notes.md",
  kind: "file",
  text: "=== notes.md ===\n# Нотатки",
  binaries: [],
};

function agent(id: string): Agent {
  return anAgent({
    id,
    name: id.toUpperCase(),
    color: "#b18aff",
    x: 0,
    y: 0,
    maxCalls: 5,
    temperature: 0.3,
  });
}

/** The person's own words, which have no sender behind them. */
function question(): IncomingWork {
  return {
    text: "Прогони тести",
    cost: null,
    fromAgentId: null,
    fromStepIds: [],
    seconds: null,
    attached: [],
  };
}

function work(fromAgentId: string): IncomingWork {
  return {
    text: `from ${fromAgentId}`,
    cost: null,
    fromAgentId,
    fromStepIds: [],
    seconds: 1,
    attached: [],
  };
}

function turn(turnId: string, agentId: string, runKey: string): TurnOut {
  return {
    turnId,
    agentId,
    startedAt: 100,
    viaLinkIds: [],
    runKey,
  };
}

/** The turns out, each under its own id, as the walk holds them. */
function working(...turns: TurnOut[]): Record<string, TurnOut> {
  return Object.fromEntries(turns.map((standing) => [standing.turnId, standing]));
}

function ledger(): RunLedger {
  return {
    walkId: "walk-1",
    askedAt: 100,
    runId: "run-1",
    questionId: "question-1",
    out: 1,
    stepIdOf: {},
    queue: Promise.resolve(),
  };
}

/** One turn come back; the patch sets what it says, the rest is a plain good answer. */
function answer(patch: Partial<TurnAnswer> = {}): TurnAnswer {
  return {
    text: "Тести пройшли",
    note: null,
    cost: null,
    answerCeiling: null,
    isFailure: false,
    fell: null,
    isCut: false,
    notStarted: null,
    wouldGo: null,
    state: RUN_STEP_DONE,
    calls: [],
    compressed: null,
    toolMemories: [],
    route: null,
    ...patch,
  };
}

/** One agent's turn that came back, as the machine is told of it. */
function back(agentId: string, patch: Partial<TurnAnswer> = {}): Extract<WalkEvent, { kind: "answered" }> {
  return {
    kind: "answered",
    agent: agent(agentId),
    turnId: "turn-1",
    runKey: "walk-1",
    incoming: [question()],
    startAgentId: agentId,
    asked: "Прогони тести",
    memoryLength: 0,
    answer: answer(patch),
    saidId: "said-1",
    startedAt: 100,
    endedAt: 1100,
  };
}

/** The row «СПИТАТИ ЩЕ РАЗ» stands under: a turn of one walk that ended in anything but an answer. */
function broken(id: string, walkId: string): ChatMessage {
  return {
    id,
    agentId: "editor",
    from: "agent",
    text: "",
    at: "2026-09-05T10:00:00.000Z",
    questionId: "question-1",
    askedAt: 100,
    cost: null,
    answerCeiling: null,
    otherAgentId: null,
    stopReason: null,
    isFailure: true,
    notStarted: null,
    wouldGo: null,
    began: null,
    stepId: null,
    walkId,
    note: null,
    asked: null,
    fedBy: [],
    attached: [],
    compressed: null,
    calls: [],
  };
}

function wait(): WaitedWork {
  return {
    startAgentId: "editor",
    awaitedIds: ["editor"],
    settledIds: [],
    arrived: [],
    viaLinkIds: [],
    isAwaitingRepeat: false,
    isSilent: false,
  };
}

function config(agents: Agent[] = [], links: [string, string][] = []): ProjectConfig {
  return aConfig({
    agents,
    links: links.map(([from, to], place): Link => ({
      id: `link-${place}`,
      from,
      to,
    })),
  });
}

const NO_LINES = config();

/** One walk as the machine holds it, with the spec's patch. */
function held(patch: Partial<Walk> = {}): Walk {
  return {
    ...begunWalk("question-1", 100),
    ...patch,
  };
}

function stoppedWalks(state: WalkState): string[] {
  return Object.keys(state.walks)
    .filter((runKey) => state.walks[runKey].isStopped)
    .sort();
}

function putAwayWalks(state: WalkState): string[] {
  return Object.keys(state.walks)
    .filter((runKey) => state.walks[runKey].isPutAway)
    .sort();
}

/** A stream holding one walk, «walk-1», unless the spec says otherwise. */
function walk(patch: Partial<WalkState> = {}): WalkState {
  return {
    ...emptyWalk(),
    walks: {
      "walk-1": held(),
    },
    ...patch,
  };
}

describe("walkMachine · a walk that broke or was stopped", () => {
  it("marks the walk before a single turn of it is stopped, so nothing of it begins after", () => {
    const { state } = walkMachine(
      walk(),
      {
        kind: "stopped",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.deepEqual(stoppedWalks(state), ["walk-1"]);
  });

  it("asks every turn of that walk to stop, and no turn of any other", () => {
    const { effects } = walkMachine(
      walk({
        out: working(
          turn("turn-1", "editor", "walk-1"),
          turn("turn-2", "tester", "walk-1"),
          turn("turn-3", "writer", "walk-2"),
        ),
      }),
      {
        kind: "stopped",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.deepEqual(effects, [
      {
        kind: "stopMachine",
        turnId: "turn-1",
      },
      {
        kind: "stopMachine",
        turnId: "turn-2",
      },
    ]);
  });

  it("leaves the walks already stopped stopped, since a second break is not a new one", () => {
    const { state } = walkMachine(
      walk({
        walks: {
          "walk-1": held({
            isStopped: true,
          }),
          "walk-2": held(),
        },
      }),
      {
        kind: "stopped",
        runKey: "walk-2",
      },
      NO_LINES,
    );

    assert.deepEqual(stoppedWalks(state), ["walk-1", "walk-2"]);
  });

  it("leaves the walk untouched by an event it has no rule for yet", () => {
    const standing = walk();

    assert.deepEqual(
      walkMachine(
        standing,
        {
          kind: "released",
          fromId: "editor",
          startAgentId: "editor",
          runKey: "walk-1",
        },
        NO_LINES,
      ),
      {
        state: standing,
        effects: [],
      },
    );
  });
});

describe("walkMachine · the row of a walk", () => {
  it("writes into the walk the row its question opened", () => {
    const { state } = walkMachine(
      walk({
        walks: {
          "walk-1": held(),
        },
      }),
      {
        kind: "rowOpened",
        runKey: "walk-1",
        runId: "run-1",
      },
      NO_LINES,
    );

    assert.equal(state.walks["walk-1"]?.runId, "run-1");
  });

  it("leaves a walk that already knows its own row: a row is opened once", () => {
    const { state } = walkMachine(
      walk({
        walks: {
          "walk-1": {
            ...held(),
            runId: "run-1",
          },
        },
      }),
      {
        kind: "rowOpened",
        runKey: "walk-1",
        runId: "run-2",
      },
      NO_LINES,
    );

    assert.equal(state.walks["walk-1"]?.runId, "run-1");
  });
});

describe("walkMachine · a stream emptied", () => {
  it("puts every walk of the record away, so each writes on and draws nothing", () => {
    const { state } = walkMachine(
      walk({
        ledgers: {
          "walk-0": ledger(),
          "walk-1": ledger(),
          "walk-2": ledger(),
        },
        walks: {
          "walk-0": held({
            isPutAway: true,
          }),
          "walk-1": held(),
          "walk-2": held(),
        },
      }),
      {
        kind: "putAway",
        stream: "stream-1",
      },
      NO_LINES,
    );

    assert.deepEqual(putAwayWalks(state), ["walk-0", "walk-1", "walk-2"]);
  });

  it("takes what was typed here and the row of this stream, and no walk's words with them", () => {
    const { state } = walkMachine(
      walk({
        ledgers: {
          "walk-1": ledger(),
        },
        walks: {
          "walk-1": held(),
        },
        drafts: {
          "stream-1": "Прогони тести",
          "stream-2": "Інший стрім",
        },
        flowRunId: "run-1",
      }),
      {
        kind: "putAway",
        stream: "stream-1",
      },
      NO_LINES,
    );

    // A walk still out keeps every word it said; its run holds them when reopened.
    assert.deepEqual(state.walks["walk-1"]?.said, []);
    // Every other stream keeps what stands typed in it.
    assert.deepEqual(state.drafts, {
      "stream-2": "Інший стрім",
    });
    assert.equal(state.flowRunId, null);
  });

  it("lets a walk already over go whole: its words stand in the record it wrote", () => {
    const { state } = walkMachine(
      walk({
        walks: {
          "walk-1": held(),
        },
      }),
      {
        kind: "putAway",
        stream: "stream-1",
      },
      NO_LINES,
    );

    assert.deepEqual(state.walks, {});
  });

  it("lets down a wait whose walk the record no longer holds, and keeps the rest", () => {
    const { state } = walkMachine(
      walk({
        ledgers: {
          "walk-1": ledger(),
        },
        walks: {
          "walk-1": held({
            waiting: {
              reviewer: wait(),
            },
          }),
          "walk-gone": held({
            waiting: {
              writer: wait(),
            },
          }),
        },
      }),
      {
        kind: "putAway",
        stream: "stream-1",
      },
      NO_LINES,
    );

    assert.deepEqual(Object.keys(state.walks), ["walk-1"]);
    assert.deepEqual(Object.keys(state.walks["walk-1"].waiting), ["reviewer"]);
  });
});

describe("walkMachine · a supplier of a converging point settled", () => {
  const point = agent("titler");
  const awaited = ["thesaurus", "shortener"];

  it("holds what arrived while another supplier is still to come", () => {
    const { state, effects } = walkMachine(
      walk(),
      {
        kind: "settled",
        to: point,
        awaited,
        fromId: "thesaurus",
        work: work("thesaurus"),
        startAgentId: "thesaurus",
        via: "link-1",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.deepEqual(state.walks["walk-1"]?.waiting.titler?.settledIds, ["thesaurus"]);
    assert.equal(state.walks["walk-1"]?.waiting.titler?.arrived.length, 1);
    assert.deepEqual(effects, []);
  });

  it("puts everything the point gathered to the agent when the last supplier has been", () => {
    const stood: WaitedWork = {
      startAgentId: "thesaurus",
      awaitedIds: awaited,
      settledIds: ["thesaurus"],
      arrived: [work("thesaurus")],
      viaLinkIds: ["link-1"],
      isAwaitingRepeat: false,
      isSilent: false,
    };
    const { state, effects } = walkMachine(
      walk({
        walks: {
          "walk-1": held({
            waiting: {
              titler: stood,
            },
          }),
        },
      }),
      {
        kind: "settled",
        to: point,
        awaited,
        fromId: "shortener",
        work: work("shortener"),
        startAgentId: "thesaurus",
        via: "link-2",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.equal(state.walks["walk-1"]?.waiting.titler, undefined);
    assert.deepEqual(effects, [
      {
        kind: "askAgent",
        agent: point,
        incoming: [work("thesaurus"), work("shortener")],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-1", "link-2"],
        runKey: "walk-1",
        isAgain: false,
        missing: 0,
      },
    ]);
  });

  it("lets down whoever waits behind a point that gathered nothing at all", () => {
    const { state, effects } = walkMachine(
      walk(),
      {
        kind: "settled",
        to: point,
        awaited: ["thesaurus"],
        fromId: "thesaurus",
        work: null,
        startAgentId: "thesaurus",
        via: null,
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.equal(state.walks["walk-1"]?.waiting.titler, undefined);
    assert.deepEqual(effects, [
      {
        kind: "letDown",
        fromId: "titler",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
    ]);
  });

  it("keeps a point of a broken walk standing, so the repeat finds it where it was", () => {
    const { state, effects } = walkMachine(
      walk({
        walks: {
          "walk-1": held({
            isStopped: true,
          }),
        },
      }),
      {
        kind: "settled",
        to: point,
        awaited: ["thesaurus"],
        fromId: "thesaurus",
        work: work("thesaurus"),
        startAgentId: "thesaurus",
        via: "link-1",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.equal(state.walks["walk-1"]?.waiting.titler?.isAwaitingRepeat, true);
    assert.deepEqual(effects, []);
  });
});

describe("walkMachine · a converging point that does not wait", () => {
  const point = {
    ...agent("titler"),
    waitsForAll: false,
  };
  const awaited = ["thesaurus", "shortener"];

  it("sends the arrival on the moment it comes, while another supplier is still to come", () => {
    const { state, effects } = walkMachine(
      walk(),
      {
        kind: "settled",
        to: point,
        awaited,
        fromId: "thesaurus",
        work: work("thesaurus"),
        startAgentId: "thesaurus",
        via: "link-1",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    // The work went at once as its own turn, not gathered or held for the other supplier.
    assert.deepEqual(effects, [
      {
        kind: "askAgent",
        agent: point,
        incoming: [work("thesaurus")],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-1"],
        runKey: "walk-1",
        isAgain: false,
        missing: 0,
      },
    ]);
    // The tally only spots an all-silent run; the other supplier is still awaited.
    assert.deepEqual(state.walks["walk-1"]?.waiting.titler?.settledIds, ["thesaurus"]);
  });

  it("sends the last supplier's work too, and forgets the tally without gathering", () => {
    const stood: WaitedWork = {
      startAgentId: "thesaurus",
      awaitedIds: awaited,
      settledIds: ["thesaurus"],
      arrived: [work("thesaurus")],
      viaLinkIds: ["link-1"],
      isAwaitingRepeat: false,
      isSilent: true,
    };
    const { state, effects } = walkMachine(
      walk({
        walks: {
          "walk-1": held({
            waiting: {
              titler: stood,
            },
          }),
        },
      }),
      {
        kind: "settled",
        to: point,
        awaited,
        fromId: "shortener",
        work: work("shortener"),
        startAgentId: "thesaurus",
        via: "link-2",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    // Only this arrival goes; the earlier one already went on its own, nothing is combined.
    assert.deepEqual(effects, [
      {
        kind: "askAgent",
        agent: point,
        incoming: [work("shortener")],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-2"],
        runKey: "walk-1",
        isAgain: false,
        missing: 0,
      },
    ]);
    assert.equal(state.walks["walk-1"]?.waiting.titler, undefined);
  });

  it("lets down whoever waits behind it only when every supplier settled with nothing", () => {
    const { effects } = walkMachine(
      walk(),
      {
        kind: "settled",
        to: point,
        awaited: ["thesaurus"],
        fromId: "thesaurus",
        work: null,
        startAgentId: "thesaurus",
        via: null,
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.deepEqual(effects, [
      {
        kind: "letDown",
        fromId: "titler",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
    ]);
  });
});

describe("walkMachine · a point that will not answer", () => {
  const thesaurus = agent("thesaurus");
  const shortener = agent("shortener");
  const titler = agent("titler");

  it("passes the release along a line with one supplier, and asks nobody on the way", () => {
    const lines = config(
      [thesaurus, shortener, titler],
      [
        ["thesaurus", "shortener"],
        ["shortener", "titler"],
      ],
    );
    const { state, effects } = walkMachine(
      walk(),
      {
        kind: "released",
        fromId: "thesaurus",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
      lines,
    );

    // Nobody waited on a single line, so the walk runs to its end and nothing is asked.
    assert.deepEqual(state.walks["walk-1"]?.waiting ?? {}, {});
    assert.deepEqual(effects, []);
  });

  it("settles a converging point with nothing, and the point lets down whoever stands behind it", () => {
    // The point waits for both only where the run reaches both: the walk out of the thesaurus goes to the shortener
    // too.
    const lines = config(
      [thesaurus, shortener, titler],
      [
        ["thesaurus", "shortener"],
        ["thesaurus", "titler"],
        ["shortener", "titler"],
      ],
    );
    const { state, effects } = walkMachine(
      walk({
        walks: {
          "walk-1": held({
            waiting: {
              titler: {
                startAgentId: "thesaurus",
                awaitedIds: ["thesaurus", "shortener"],
                settledIds: [],
                arrived: [],
                viaLinkIds: [],
                isAwaitingRepeat: false,
                isSilent: false,
              },
            },
          }),
        },
      }),
      {
        kind: "released",
        fromId: "thesaurus",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
      lines,
    );

    assert.equal(state.walks["walk-1"]?.waiting.titler, undefined);
    assert.deepEqual(effects, [
      {
        kind: "letDown",
        fromId: "titler",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
    ]);
  });

  it("passes a point that already holds a turn: working is no wall, and nothing waits behind it", () => {
    const lines = config(
      [thesaurus, shortener, titler],
      [
        ["thesaurus", "titler"],
        ["shortener", "titler"],
      ],
    );
    const { state, effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "titler", "walk-1")),
      }),
      {
        kind: "released",
        fromId: "thesaurus",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
      lines,
    );

    assert.deepEqual(state.walks["walk-1"]?.waiting ?? {}, {});
    assert.deepEqual(effects, []);
  });

  it("walks a ring only once, so a line drawn back on itself cannot go round for ever", () => {
    const lines = config(
      [thesaurus, shortener],
      [
        ["thesaurus", "shortener"],
        ["shortener", "thesaurus"],
      ],
    );
    const { effects } = walkMachine(
      walk(),
      {
        kind: "released",
        fromId: "thesaurus",
        startAgentId: "thesaurus",
        runKey: "walk-1",
      },
      lines,
    );

    assert.deepEqual(effects, []);
  });
});

describe("walkMachine · the answer takes its lines out", () => {
  const thesaurus = agent("thesaurus");
  const shortener = agent("shortener");
  const titler = agent("titler");
  const lines = config(
    [thesaurus, shortener, titler],
    [
      ["thesaurus", "shortener"],
      ["thesaurus", "titler"],
      ["shortener", "titler"],
    ],
  );

  function handedOn(out: { linkId: string; to: Agent; stopReason: "off" | null }[]) {
    return walkMachine(
      walk(),
      {
        kind: "handedOn",
        from: thesaurus,
        text: "Готово",
        cost: null,
        seconds: 3,
        startAgentId: "thesaurus",
        runKey: "walk-1",
        out,
      },
      lines,
    );
  }

  it("says a row about every line, taken or not", () => {
    const { effects } = handedOn([
      {
        linkId: "link-0",
        to: shortener,
        stopReason: null,
      },
      {
        linkId: "link-1",
        to: titler,
        stopReason: "off",
      },
    ]);

    assert.equal(effects.filter((effect) => effect.kind === "sayHandoff").length, 2);
  });

  it("puts the work to an agent standing alone the moment it arrives", () => {
    const { effects } = handedOn([
      {
        linkId: "link-0",
        to: shortener,
        stopReason: null,
      },
    ]);

    assert.deepEqual(
      effects.filter((effect) => effect.kind === "askAgent"),
      [
        {
          kind: "askAgent",
          agent: shortener,
          incoming: [
            {
              text: "Готово",
              cost: null,
              fromAgentId: "thesaurus",
              fromStepIds: [],
              seconds: 3,
              attached: [],
            },
          ],
          startAgentId: "thesaurus",
          viaLinkIds: ["link-0"],
          runKey: "walk-1",
          isAgain: false,
          missing: 0,
        },
      ],
    );
  });

  it("holds the work at a converging point instead of putting it, and asks nobody yet", () => {
    const { state, effects } = handedOn([
      {
        linkId: "link-1",
        to: titler,
        stopReason: null,
      },
    ]);

    assert.equal(state.walks["walk-1"]?.waiting.titler?.arrived.length, 1);
    assert.deepEqual(state.walks["walk-1"]?.waiting.titler?.settledIds, ["thesaurus"]);
    assert.deepEqual(
      effects.filter((effect) => effect.kind === "askAgent"),
      [],
    );
  });

  it("lets down whoever waited behind a line that could not be taken", () => {
    // The work never goes there, so the point below settles that supplier with nothing.
    const { state, effects } = handedOn([
      {
        linkId: "link-0",
        to: shortener,
        stopReason: "off",
      },
    ]);

    assert.deepEqual(state.walks["walk-1"]?.waiting.titler?.settledIds, ["shortener"]);
    assert.deepEqual(state.walks["walk-1"]?.waiting.titler?.arrived, []);
    // The hand-off only writes the row about the line.
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayHandoff"],
    );
  });

  it("settles a converging point with nothing from a line it could not take, so it goes on without that supplier", () => {
    // A supplier whose line the walk could not take never answers; the point settles it with nothing and works on what
    // arrived.
    const standing = walk({
      out: working(turn("turn-4", "titler", "walk-1")),
      walks: {
        "walk-1": held(),
        "walk-2": held(),
      },
    });
    const first = walkMachine(
      standing,
      {
        kind: "handedOn",
        from: thesaurus,
        text: "Готово",
        cost: null,
        seconds: 3,
        startAgentId: "thesaurus",
        runKey: "walk-2",
        out: [
          {
            linkId: "link-0",
            to: shortener,
            stopReason: null,
          },
          {
            linkId: "link-1",
            to: titler,
            stopReason: "off",
          },
        ],
      },
      lines,
    );

    // Nothing ever goes down that line, so the point counts the supplier as settled with nothing.
    assert.deepEqual(first.state.walks["walk-2"].waiting.titler?.settledIds, ["thesaurus"]);
    assert.deepEqual(first.state.walks["walk-2"].waiting.titler?.arrived, []);

    const second = walkMachine(
      {
        ...first.state,
        out: {},
      },
      {
        kind: "handedOn",
        from: shortener,
        text: "Стисло",
        cost: null,
        seconds: 2,
        startAgentId: "thesaurus",
        runKey: "walk-2",
        out: [
          {
            linkId: "link-2",
            to: titler,
            stopReason: null,
          },
        ],
      },
      lines,
    );

    assert.equal(second.state.walks["walk-2"].waiting.titler, undefined);
    assert.deepEqual(
      second.effects.filter((effect) => effect.kind === "askAgent").map((effect) => effect.incoming),
      [
        [
          {
            text: "Стисло",
            cost: null,
            fromAgentId: "shortener",
            fromStepIds: [],
            seconds: 2,
            attached: [],
          },
        ],
      ],
    );
  });

  it("never closes another walk's wait: two walks converging on one point hold two waits", () => {
    // One agent may be a point in two walks at once; each wait is that walk's own.
    const standing = walk({
      out: working(turn("turn-5", "shortener", "walk-1")),
      walks: {
        "walk-1": held({
          waiting: {
            titler: {
              startAgentId: "thesaurus",
              awaitedIds: ["thesaurus", "shortener"],
              settledIds: ["thesaurus"],
              arrived: [work("thesaurus")],
              viaLinkIds: ["link-1"],
              isAwaitingRepeat: false,
              isSilent: false,
            },
          },
        }),
        "walk-2": held(),
      },
    });
    const { state, effects } = walkMachine(
      standing,
      {
        kind: "handedOn",
        from: thesaurus,
        text: "Готово вдруге",
        cost: null,
        seconds: 3,
        startAgentId: "thesaurus",
        runKey: "walk-2",
        out: [
          {
            linkId: "link-0",
            to: shortener,
            stopReason: "off",
          },
          {
            linkId: "link-1",
            to: titler,
            stopReason: null,
          },
        ],
      },
      lines,
    );

    // Walk-1's point is unchanged: its shortener is still to come.
    assert.deepEqual(state.walks["walk-1"].waiting.titler, standing.walks["walk-1"].waiting.titler);
    // Walk-2's point settled both (shortener with nothing, thesaurus with words) and went.
    assert.equal(state.walks["walk-2"].waiting.titler, undefined);
    assert.deepEqual(
      effects.filter((effect) => effect.kind === "askAgent"),
      [
        {
          kind: "askAgent",
          agent: titler,
          incoming: [
            {
              text: "Готово вдруге",
              cost: null,
              fromAgentId: "thesaurus",
              fromStepIds: [],
              seconds: 3,
              attached: [],
            },
          ],
          startAgentId: "thesaurus",
          viaLinkIds: ["link-1"],
          runKey: "walk-2",
          isAgain: false,
          missing: 1,
        },
      ],
    );
  });
});

describe("walkMachine · work put to an agent", () => {
  const editor = agent("editor");

  function asked(patch: Partial<Extract<Parameters<typeof walkMachine>[1], { kind: "asked" }>> = {}, state = walk()) {
    return walkMachine(
      state,
      {
        kind: "asked",
        agent: editor,
        incoming: [question()],
        startAgentId: "editor",
        viaLinkIds: [],
        runKey: "walk-1",
        isAgain: false,
        missing: 0,
        turnId: "turn-1",
        startedAt: 100,
        ...patch,
      },
      NO_LINES,
    );
  }

  it("puts the turn out and marks the agent as working", () => {
    const { state, effects } = asked();

    assert.equal(state.out["turn-1"]?.agentId, "editor");
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayAsked", "askMachine"],
    );
  });

  it("begins nothing of a walk that was stopped", () => {
    const { state, effects } = asked(
      {},
      walk({
        walks: {
          "walk-1": held({
            isStopped: true,
          }),
        },
      }),
    );

    assert.deepEqual(state.out, {});
    assert.deepEqual(effects, []);
  });

  it("begins nothing where nothing came", () => {
    const { effects } = asked({
      incoming: [],
    });

    assert.deepEqual(effects, []);
  });

  it("stands a person's question aimed at an agent switched off in the stream, with the row saying why it stayed", () => {
    const { state, effects } = asked({
      agent: {
        ...editor,
        isActive: false,
      },
    });

    // The question is the person's, so it is said; nothing goes out and the walk is over at once.
    assert.deepEqual(state.out, {});
    assert.deepEqual(effects, [
      {
        kind: "sayAsked",
        runKey: "walk-1",
        agentId: "editor",
        incoming: [question()],
        questionId: "question-1",
        askedAt: 100,
        isAgain: false,
      },
      {
        kind: "sayHandoff",
        runKey: "walk-1",
        fromAgentId: null,
        toAgentId: "editor",
        stopReason: "off",
        questionId: "question-1",
        askedAt: 100,
      },
      {
        kind: "turnBack",
        runKey: "walk-1",
      },
    ]);
  });

  it("puts the turn out where the agent already holds one of another walk: walks run side by side", () => {
    // Working is no wall: the agent takes a turn for every walk asking it.
    const { state, effects } = asked(
      {},
      walk({
        out: working(turn("turn-0", "editor", "walk-0")),
      }),
    );

    assert.deepEqual(Object.keys(state.out).sort(), ["turn-0", "turn-1"]);
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayAsked", "askMachine"],
    );
  });
});

describe("walkMachine · the person stops the stream", () => {
  it("cuts every walk this stream holds", () => {
    const { state } = walkMachine(
      walk({
        walks: {
          "walk-1": held(),
          "walk-2": held(),
        },
        out: working(turn("turn-2", "editor", "walk-2")),
      }),
      {
        kind: "stopped",
        runKey: null,
      },
      NO_LINES,
    );

    assert.deepEqual(stoppedWalks(state), ["walk-1", "walk-2"]);
  });

  it("leaves a walk put away alone: it was let go, not stopped", () => {
    const { state, effects } = walkMachine(
      walk({
        ledgers: {
          "walk-1": ledger(),
        },
        out: working(turn("turn-1", "editor", "walk-1")),
        walks: {
          "walk-1": held({
            isPutAway: true,
          }),
        },
      }),
      {
        kind: "stopped",
        runKey: null,
      },
      NO_LINES,
    );

    assert.deepEqual(stoppedWalks(state), []);
    assert.deepEqual(effects, []);
  });

  it("cuts the walks of the row on screen and leaves another conversation running", () => {
    // Two conversations at once: the button speaks for its own stream, and the other row's work is neither cut nor
    // asked to stop.
    const { state, effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1"), turn("turn-2", "editor", "walk-2")),
        walks: {
          "walk-1": {
            ...held(),
            runId: "run-1",
          },
          "walk-2": {
            ...held(),
            runId: "run-2",
          },
        },
        flowRunId: "run-1",
      }),
      {
        kind: "stopped",
        runKey: null,
      },
      NO_LINES,
    );

    assert.deepEqual(stoppedWalks(state), ["walk-1"]);
    assert.deepEqual(effects, [
      {
        kind: "stopMachine",
        turnId: "turn-1",
      },
    ]);
  });

  it("asks every turn of the walks it cut to stop", () => {
    const { effects } = walkMachine(
      walk({
        walks: {
          "walk-1": held(),
          "walk-2": held(),
        },
        out: working(turn("turn-1", "editor", "walk-1"), turn("turn-2", "reviewer", "walk-2")),
      }),
      {
        kind: "stopped",
        runKey: null,
      },
      NO_LINES,
    );

    assert.deepEqual(effects, [
      {
        kind: "stopMachine",
        turnId: "turn-1",
      },
      {
        kind: "stopMachine",
        turnId: "turn-2",
      },
    ]);
  });
});

describe("walkMachine · a walk picked up where it broke", () => {
  const thesaurus = agent("thesaurus");
  const shortener = agent("shortener");
  const titler = agent("titler");
  const lines = config(
    [thesaurus, shortener, titler],
    [
      ["thesaurus", "shortener"],
      ["shortener", "titler"],
    ],
  );

  function whole(
    left: RunUnfinished,
    state = walk(),
    notSentTo: string | null = null,
    drawn = lines,
    attached: PackedAttachment[] = [],
  ) {
    return walkMachine(
      state,
      {
        kind: "repeated",
        left,
        walk: [],
        startAgentId: "thesaurus",
        runKey: "walk-2",
        runId: "run-1",
        questionId: "question-1",
        askedAt: 100,
        notSentTo,
        asked: "Прогони тести",
        attached,
      },
      drawn,
    );
  }

  /** A repeat run against fewer lines than the whole set, an agent being off among them. */
  function repeatedIn(left: RunUnfinished, drawn: ProjectConfig) {
    const next = whole(left, walk(), null, drawn);

    return {
      state: next.state,
      effects: next.effects.filter((effect) => effect.kind !== "takeWalk"),
    };
  }

  /** Every repeat takes its walk first; that effect has its own spec and the rest read without it. */
  function repeated(left: RunUnfinished, state = walk(), notSentTo: string | null = null) {
    const next = whole(left, state, notSentTo);

    return {
      state: next.state,
      effects: next.effects.filter((effect) => effect.kind !== "takeWalk"),
    };
  }

  it("takes the walk into the row and the question it already has, and opens neither", () => {
    const { effects } = whole({
      again: [],
      arrivals: [],
    });

    assert.deepEqual(effects[0], {
      kind: "takeWalk",
      runKey: "walk-2",
      // The repeat is not the person's question, so it stands in the block of the one it picks up.
      askedAt: 100,
      runId: "run-1",
      questionId: "question-1",
    });
  });

  it("puts a question that never went again with the files it was sent with, for them to be glued in as before", () => {
    const { effects } = whole(
      {
        again: [],
        arrivals: [],
      },
      walk(),
      "shortener",
      lines,
      [NOTES],
    );

    assert.deepEqual(
      effects.filter((effect) => effect.kind === "askAgent"),
      [
        {
          kind: "askAgent",
          agent: shortener,
          incoming: [
            {
              text: "Прогони тести",
              cost: null,
              fromAgentId: null,
              fromStepIds: [],
              seconds: null,
              attached: [NOTES],
            },
          ],
          startAgentId: "shortener",
          viaLinkIds: [],
          runKey: "walk-2",
          isAgain: true,
          missing: 0,
        },
      ],
    );
  });

  it("runs a turn that ended in anything but an answer again, word for word", () => {
    const { effects } = repeated({
      again: [
        {
          agentId: "shortener",
          asked: "Стисни це",
          fromStepIds: [],
        },
      ],
      arrivals: [],
    });

    assert.deepEqual(effects, [
      {
        kind: "askAgent",
        agent: shortener,
        incoming: [
          {
            text: "Стисни це",
            cost: null,
            fromAgentId: null,
            fromStepIds: [],
            seconds: null,
            attached: [],
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: [],
        runKey: "walk-2",
        isAgain: true,
        missing: 0,
      },
    ]);
  });

  it("puts the work that arrived and was never taken up, by the line it came down", () => {
    const { effects } = repeated({
      again: [],
      arrivals: [
        {
          toAgentId: "shortener",
          fromStepId: "step-1",
          fromAgentId: "thesaurus",
          text: "Готово",
          stopReason: null,
        },
      ],
    });

    assert.deepEqual(effects, [
      {
        kind: "askAgent",
        agent: shortener,
        incoming: [
          {
            text: "Готово",
            cost: null,
            fromAgentId: "thesaurus",
            fromStepIds: ["step-1"],
            seconds: null,
            attached: [],
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-0"],
        runKey: "walk-2",
        isAgain: false,
        missing: 0,
      },
    ]);
  });

  it("does not put work down a line the agent did not choose, and closes the point behind it with nothing", () => {
    const { effects } = repeated({
      again: [],
      arrivals: [
        {
          toAgentId: "shortener",
          fromStepId: "step-1",
          fromAgentId: "thesaurus",
          text: "Готово",
          stopReason: "notChosen",
        },
      ],
    });

    // Shortener is the only one who would have fed titler; with it cut nothing goes anywhere, and the row stands already.
    assert.deepEqual(
      effects.filter((effect) => effect.kind === "askAgent" || effect.kind === "sayHandoff"),
      [],
    );
  });

  it("gives a point the work that did arrive and tells it how many lines were cut", () => {
    const { effects } = repeatedIn(
      {
        again: [],
        arrivals: [
          {
            toAgentId: "titler",
            fromStepId: "step-1",
            fromAgentId: "thesaurus",
            text: "Готово",
            stopReason: null,
          },
          {
            toAgentId: "shortener",
            fromStepId: "step-1",
            fromAgentId: "thesaurus",
            text: "Готово",
            stopReason: "finished",
          },
        ],
      },
      config(
        [thesaurus, shortener, titler],
        [
          ["thesaurus", "shortener"],
          ["thesaurus", "titler"],
          ["shortener", "titler"],
        ],
      ),
    );
    const given = effects.filter((effect) => effect.kind === "askAgent");

    assert.deepEqual(
      given.map((effect) => effect.kind === "askAgent" && [effect.agent.id, effect.missing]),
      [["titler", 1]],
    );
    assert.equal(
      effects.some((effect) => effect.kind === "sayHandoff"),
      false,
    );
  });

  it("says a neighbour the repeat cannot reach, and lets down whoever waited behind it", () => {
    const { effects } = repeatedIn(
      {
        again: [
          {
            agentId: "shortener",
            asked: "Стисни це",
            fromStepIds: [],
          },
        ],
        arrivals: [],
      },
      config(
        [
          thesaurus,
          {
            ...shortener,
            isActive: false,
          },
          titler,
        ],
        [
          ["thesaurus", "shortener"],
          ["thesaurus", "titler"],
          ["shortener", "titler"],
        ],
      ),
    );

    // A turn the person asked has no feeder, so the row is about the question itself.
    assert.deepEqual(effects, [
      {
        kind: "sayHandoff",
        runKey: "walk-2",
        fromAgentId: null,
        toAgentId: "shortener",
        stopReason: "off",
        questionId: "question-1",
        askedAt: 100,
      },
    ]);
  });

  it("puts the question itself where the record holds no step to run again", () => {
    const { effects } = repeated(
      {
        again: [],
        arrivals: [],
      },
      walk(),
      "thesaurus",
    );

    assert.deepEqual(effects, [
      {
        kind: "askAgent",
        agent: thesaurus,
        incoming: [
          {
            text: "Прогони тести",
            cost: null,
            fromAgentId: null,
            fromStepIds: [],
            seconds: null,
            attached: [],
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: [],
        runKey: "walk-2",
        isAgain: true,
        missing: 0,
      },
    ]);
  });
});

describe("walkMachine · the words of a walk picked up", () => {
  it("names a repeat as a repeat, so the words already standing in the stream are not said twice", () => {
    // The repeat picks the walk up; its question stands right above and is not asked again.
    const { effects } = walkMachine(
      walk(),
      {
        kind: "repeated",
        left: {
          again: [
            {
              agentId: "editor",
              asked: "Прогони тести",
              fromStepIds: [],
            },
          ],
          arrivals: [],
        },
        walk: [],
        startAgentId: "editor",
        runKey: "walk-2",
        runId: "run-1",
        questionId: "question-1",
        askedAt: 100,
        notSentTo: null,
        asked: "Прогони тести",
        attached: [],
      },
      config([agent("editor")]),
    );

    assert.deepEqual(
      effects.filter((effect) => effect.kind === "askAgent").map((effect) => effect.isAgain),
      [true],
    );
  });
});

describe("walkMachine · the turn that came back", () => {
  it("frees the agent, so no turn of it stands after the answer", () => {
    const { state } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
      }),
      back("editor"),
      config([agent("editor")]),
    );

    assert.deepEqual(state.out, {});
  });

  it("takes the lines out of an answer and hands the words on down each of them", () => {
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
      }),
      back("editor"),
      config([agent("editor"), agent("shortener")], [["editor", "shortener"]]),
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayAnswer", "sayHandoff", "askAgent"],
    );
  });

  it("hands the words down no line that leads back into the walk's own path", () => {
    // A ring that got past the drawing and the file; the machine is the last wall.
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
      }),
      back("editor"),
      config(
        [agent("editor"), agent("shortener")],
        [
          ["editor", "shortener"],
          ["shortener", "editor"],
        ],
      ),
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayAnswer"],
    );
  });

  it("ends the walk on a fall, so no line goes out of it and nothing of it begins after", () => {
    const { state, effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
      }),
      back("editor", {
        isFailure: true,
        state: RUN_STEP_FAILED,
      }),
      config([agent("editor"), agent("shortener")], [["editor", "shortener"]]),
    );

    assert.deepEqual(stoppedWalks(state), ["walk-1"]);
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayAnswer"],
    );
  });

  it("leaves the field alone when the question never went: its words stand in the stream and in the record", () => {
    const { state } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
        drafts: {
          "stream-1": "",
        },
      }),
      back("editor", {
        notStarted: "silent",
      }),
      config([agent("editor")]),
    );

    assert.deepEqual(state.drafts, {
      "stream-1": "",
    });
  });

  it("writes the turn down and counts it back only where the walk has a ledger of its own", () => {
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
        ledgers: {
          "walk-1": ledger(),
        },
      }),
      back("editor"),
      config([agent("editor")]),
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayAnswer", "writeTurn"],
    );
  });

  it("writes the provider's sentence down for a turn that fell, and makes no card of it", () => {
    // The record keeps what came back so a later-opened run says why it fell; the card holds only the model's own
    // words.
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
        ledgers: {
          "walk-1": ledger(),
        },
      }),
      back("editor", {
        text: "",
        isFailure: true,
        fell: "404 page not found",
        state: RUN_STEP_FAILED,
      }),
      config([agent("editor")]),
    );
    const written = effects.find((effect) => effect.kind === "writeTurn");
    const card = effects.find((effect) => effect.kind === "sayAnswer");

    assert.equal(written?.kind === "writeTurn" && written.turn.said, "404 page not found");
    assert.equal(card?.kind === "sayAnswer" && card.turn.said, "");
  });
});

describe("walkMachine · the agent chose its route", () => {
  const dispatcher = "dispatcher";
  const teller = "teller";
  const translator = "translator";
  const editor = "editor";

  /** The dispatcher's turn back, its choice set, in a walk the writer does not hold. */
  function chose(
    route: TurnAnswer["route"],
    lines: ProjectConfig,
    standing: WalkState = walk({
      out: working(turn("turn-1", dispatcher, "walk-1")),
    }),
  ) {
    return walkMachine(
      standing,
      back(dispatcher, {
        route,
      }),
      lines,
    );
  }

  const asked = (effects: WalkEffect[]) =>
    effects.flatMap((effect) => (effect.kind === "askAgent" ? [effect.agent.id] : []));

  const said = (effects: WalkEffect[]) =>
    effects.flatMap((effect) => (effect.kind === "sayHandoff" ? [[effect.toAgentId, effect.stopReason]] : []));

  const FORK = config(
    [agent(dispatcher), agent(teller), agent(translator)],
    [
      [dispatcher, teller],
      [dispatcher, translator],
    ],
  );
  const JOIN = config(
    [agent(dispatcher), agent(teller), agent(translator), agent(editor)],
    [
      [dispatcher, teller],
      [dispatcher, translator],
      [teller, editor],
      [translator, editor],
    ],
  );

  it("puts the work only to the agents it named, and says of the others that it was not chosen", () => {
    const { effects } = chose(
      {
        toAgentIds: [teller],
        isFinished: false,
      },
      FORK,
    );

    assert.deepEqual(said(effects), [
      [teller, null],
      [translator, "notChosen"],
    ]);
    assert.deepEqual(asked(effects), [teller]);
  });

  it("puts the work to every line where it chose nothing", () => {
    const { effects } = chose(null, FORK);

    assert.deepEqual(asked(effects), [teller, translator]);
  });

  it("puts the work to no line where it ended the branch, and says so of each", () => {
    const { effects } = chose(
      {
        toAgentIds: [],
        isFinished: true,
      },
      FORK,
    );

    assert.deepEqual(said(effects), [
      [teller, "finished"],
      [translator, "finished"],
    ]);
    assert.deepEqual(asked(effects), []);
  });

  it("leaves a switched-off agent it named to the wall, which is its own reason", () => {
    const off = anAgent({
      id: "off",
      name: "OFF",
      isActive: false,
    });
    const { effects } = chose(
      {
        toAgentIds: ["off", teller],
        isFinished: false,
      },
      config(
        [agent(dispatcher), off, agent(teller)],
        [
          [dispatcher, "off"],
          [dispatcher, teller],
        ],
      ),
    );

    assert.deepEqual(said(effects), [
      ["off", "off"],
      [teller, null],
    ]);
    assert.deepEqual(asked(effects), [teller]);
  });

  it("settles the point below with nothing from the line not chosen, so it waits for those that were", () => {
    const { state } = chose(
      {
        toAgentIds: [teller],
        isFinished: false,
      },
      JOIN,
    );

    // The translator will never answer: the editor's wait counts it settled with nothing, and still waits for the teller.
    const wait = state.walks["walk-1"].waiting[editor];

    assert.deepEqual(wait?.settledIds, [translator]);
    assert.deepEqual(wait?.arrived, []);
  });

  it("goes on at the point below with what the agents chosen answered, once they have", () => {
    const afterChoice = chose(
      {
        toAgentIds: [teller],
        isFinished: false,
      },
      JOIN,
    );
    const { effects, state } = walkMachine(
      {
        ...afterChoice.state,
        out: working(turn("turn-2", teller, "walk-1")),
      },
      {
        ...back(teller),
        turnId: "turn-2",
        startAgentId: dispatcher,
        saidId: "said-2",
      },
      JOIN,
    );

    assert.deepEqual(asked(effects), [editor]);
    assert.equal(state.walks["walk-1"].waiting[editor], undefined);

    const given = <{ incoming: IncomingWork[]; missing: number }>effects.find((effect) => effect.kind === "askAgent");

    // The editor works on the teller's words alone, and is told that one supplier of two gave nothing.
    assert.deepEqual(
      given.incoming.map((one) => one.fromAgentId),
      [teller],
    );
    assert.equal(given.missing, 1);
  });

  it("tells the point nobody is missing when every supplier passed its work on", () => {
    const afterChoice = chose(
      {
        toAgentIds: [teller, translator],
        isFinished: false,
      },
      JOIN,
    );
    const first = walkMachine(
      {
        ...afterChoice.state,
        out: working(turn("turn-2", teller, "walk-1"), turn("turn-3", translator, "walk-1")),
      },
      {
        ...back(teller),
        turnId: "turn-2",
        startAgentId: dispatcher,
        saidId: "said-2",
      },
      JOIN,
    );
    const { effects } = walkMachine(
      first.state,
      {
        ...back(translator),
        turnId: "turn-3",
        startAgentId: dispatcher,
        saidId: "said-3",
      },
      JOIN,
    );
    const given = <{ missing: number; incoming: IncomingWork[] }>effects.find((effect) => effect.kind === "askAgent");

    assert.equal(given.incoming.length, 2);
    assert.equal(given.missing, 0);
  });

  it("puts the count of suppliers that gave nothing under the work the point is asked on", () => {
    const put = (missing: number) => {
      const { effects } = walkMachine(
        walk(),
        {
          kind: "asked",
          agent: agent(editor),
          incoming: [
            {
              text: "Функція сортування.",
              cost: null,
              fromAgentId: teller,
              fromStepIds: [],
              seconds: 2,
              attached: [],
            },
          ],
          startAgentId: dispatcher,
          viaLinkIds: [],
          runKey: "walk-1",
          isAgain: false,
          missing,
          turnId: "turn-9",
          startedAt: 100,
        },
        JOIN,
      );
      const machine = effects.find((effect) => effect.kind === "askMachine");

      return machine?.kind === "askMachine" ? machine.asked : null;
    };

    assert.equal(put(0), "Функція сортування.");
    assert.equal(put(1), "Функція сортування.\n\nНе передали нічого: 1 з 2 постачальників роботи.");
  });

  it("carries the cut down a line with one supplier until it meets a point, and settles that point with nothing", () => {
    // dispatcher → teller → editor, dispatcher → middle → translator → editor: not naming the middle cuts the translator too.
    const lines = config(
      [agent(dispatcher), agent(teller), agent("middle"), agent(translator), agent(editor)],
      [
        [dispatcher, teller],
        [dispatcher, "middle"],
        ["middle", translator],
        [teller, editor],
        [translator, editor],
      ],
    );
    const { state, effects } = chose(
      {
        toAgentIds: [teller],
        isFinished: false,
      },
      lines,
    );

    assert.deepEqual(asked(effects), [teller]);
    assert.deepEqual(state.walks["walk-1"].waiting[editor]?.settledIds, [translator]);
  });

  it("lets down whoever waits behind a point that no line chosen reaches", () => {
    const { effects } = chose(
      {
        toAgentIds: [],
        isFinished: true,
      },
      JOIN,
    );

    // Both suppliers of the editor are cut, so it gathers nothing and does not run.
    assert.deepEqual(asked(effects), []);
  });

  it("goes down the same lines at a point that does not wait, and runs it on what came", () => {
    const loose = config(
      [
        agent(dispatcher),
        agent(teller),
        agent(translator),
        anAgent({
          id: editor,
          name: "EDITOR",
          waitsForAll: false,
        }),
      ],
      [
        [dispatcher, teller],
        [dispatcher, translator],
        [teller, editor],
        [translator, editor],
      ],
    );
    const afterChoice = chose(
      {
        toAgentIds: [teller],
        isFinished: false,
      },
      loose,
    );
    const { effects } = walkMachine(
      {
        ...afterChoice.state,
        out: working(turn("turn-2", teller, "walk-1")),
      },
      {
        ...back(teller),
        turnId: "turn-2",
        startAgentId: dispatcher,
        saidId: "said-2",
      },
      loose,
    );

    assert.deepEqual(asked(effects), [editor]);
  });

  it("writes the reasons of the lines into the step, beside the lines it took", () => {
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", dispatcher, "walk-1")),
        ledgers: {
          "walk-1": ledger(),
        },
      }),
      back(dispatcher, {
        route: {
          toAgentIds: [teller],
          isFinished: false,
        },
      }),
      FORK,
    );
    const written = <{ turn: { handoffs: { toAgentId: string; stopReason: string | null }[] } }>(
      effects.find((effect) => effect.kind === "writeTurn")
    );

    assert.deepEqual(written.turn.handoffs, [
      {
        toAgentId: teller,
        stopReason: null,
      },
      {
        toAgentId: translator,
        stopReason: "notChosen",
      },
    ]);
  });

  it("does not choose for a turn that fell: nothing goes down any line, whatever it named", () => {
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", dispatcher, "walk-1")),
      }),
      back(dispatcher, {
        isFailure: true,
        state: RUN_STEP_FAILED,
        text: "",
        route: {
          toAgentIds: [teller],
          isFinished: false,
        },
      }),
      FORK,
    );

    assert.deepEqual(asked(effects), []);
    assert.deepEqual(said(effects), []);
  });
});

describe("walkMachine · the person put a question", () => {
  it("writes the question down before the turn goes out, so a flow that reaches nobody still stands in the record", () => {
    const { effects } = walkMachine(
      walk({
        flowRunId: "run-1",
      }),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести",
        attached: [NOTES],
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );

    // The turn waits for the record: nothing goes to the provider before the question is written.
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["openWalk", "sayAsked"],
    );
    assert.deepEqual(effects[0], {
      kind: "openWalk",
      runKey: "walk-1",
      questionId: "question-1",
      askedAt: 100,
      // The row this walk writes into is the conversation's and predates the walk.
      runId: "run-1",
      // The row is named by the agent it began with, so the whole agent goes, not its id.
      agent: agent("editor"),
      asked: "Прогони тести",
      // The files go into the record beside the question, as they went into the turn.
      attached: [NOTES],
    });
  });

  it("stands every word of the walk in the block of the question, at the hour it was asked", () => {
    const { effects } = walkMachine(
      walk(),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести",
        attached: [],
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );
    const [, saying] = effects;

    assert.equal(saying.kind === "sayAsked" && saying.askedAt, 100);
  });

  it("puts nothing while a turn of this stream is out: a conversation walks one walk at a time", () => {
    // The button is «ЗУПИНИТИ» while something is out, so no second question enters the same conversation; another
    // conversation is «+ НОВИЙ ЧАТ» and walks beside it.
    const { state, effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
        walks: {
          "walk-1": held(),
        },
      }),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести ще раз",
        attached: [],
        fedFrom: [],
        isAgain: false,
        questionId: "question-2",
        runKey: "walk-2",
        askedAt: 200,
        turnId: "turn-2",
      },
      config([agent("editor")]),
    );

    assert.equal(state.walks["walk-2"], undefined);
    assert.deepEqual(effects, []);
  });

  it("puts the question where the turn out belongs to another conversation, standing on another row", () => {
    // That walk is not of this screen, so it is no wall here.
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
        walks: {
          "walk-1": {
            ...held(),
            runId: "run-2",
          },
        },
        flowRunId: "run-1",
      }),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести",
        attached: [],
        fedFrom: [],
        isAgain: false,
        questionId: "question-2",
        runKey: "walk-2",
        askedAt: 200,
        turnId: "turn-2",
      },
      config([agent("editor")]),
    );

    // The question goes to the record; its turn follows once it is written.
    assert.equal(
      effects.some((effect) => effect.kind === "openWalk"),
      true,
    );
  });

  it("lets down a point left waiting by a walk that is over: it held its pill only until a new walk began", () => {
    const { state } = walkMachine(
      walk({
        walks: {
          "walk-gone": held({
            waiting: {
              headliner: wait(),
            },
          }),
        },
      }),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести",
        attached: [],
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );

    // The pill goes; the walk stays, its words being the stream on screen.
    assert.deepEqual(state.walks["walk-gone"]?.waiting, {});
  });

  it("keeps a point waiting when its own walk is still being written", () => {
    const { state } = walkMachine(
      walk({
        ledgers: {
          "walk-old": ledger(),
        },
        walks: {
          "walk-old": held({
            waiting: {
              headliner: wait(),
            },
          }),
        },
      }),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести",
        attached: [],
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );

    assert.deepEqual(Object.keys(state.walks["walk-old"].waiting), ["headliner"]);
  });
});

describe("walkMachine · «СПИТАТИ ЩЕ РАЗ» pressed", () => {
  it("spends the act the moment it is pressed: it stands under a turn until it is used, and no longer", () => {
    const { state } = walkMachine(
      walk({
        flowRunId: "run-1",
      }),
      {
        kind: "sayAgain",
        said: broken("said-1", "walk-1"),
      },
      NO_LINES,
    );

    assert.deepEqual(state.saidAgain, ["said-1"]);
  });

  it("names the walk the turn was said in, and the row to read it out of — never the hour", () => {
    const { effects } = walkMachine(
      walk({
        flowRunId: "run-1",
      }),
      {
        kind: "sayAgain",
        said: broken("said-1", "walk-1"),
      },
      NO_LINES,
    );

    assert.deepEqual(effects, [
      {
        kind: "askAgain",
        runId: "run-1",
        questionId: "question-1",
        walkId: "walk-1",
        notSentTo: null,
        saidId: "said-1",
      },
    ]);
  });

  it("names whom a question that never went was aimed at: the record holds no step for it", () => {
    const { effects } = walkMachine(
      walk({
        flowRunId: "run-1",
      }),
      {
        kind: "sayAgain",
        said: {
          ...broken("said-1", "walk-1"),
          from: "notSent",
          otherAgentId: "editor",
        },
      },
      NO_LINES,
    );
    const [asking] = effects;

    assert.equal(asking.kind === "askAgain" && asking.notSentTo, "editor");
  });

  it("stands still with no row of its own: there is nothing to read the walk out of", () => {
    const { effects } = walkMachine(
      walk(),
      {
        kind: "sayAgain",
        said: broken("said-1", "walk-1"),
      },
      NO_LINES,
    );

    assert.deepEqual(effects, []);
  });
});

/** The person's question to the editor, as the walk holds it while the record writes it. */
function putToEditor(): WalkState {
  return walkMachine(
    walk({
      walks: {},
    }),
    {
      kind: "put",
      agent: agent("editor"),
      text: "Прогони тести",
      attached: [NOTES],
      fedFrom: [],
      isAgain: false,
      questionId: "question-1",
      runKey: "walk-1",
      askedAt: 100,
      turnId: "turn-1",
    },
    config([agent("editor")]),
  ).state;
}

/** The person's card as the stream holds it under the walk. */
function withPersonCard(state: WalkState): WalkState {
  return {
    ...state,
    walks: {
      "walk-1": {
        ...state.walks["walk-1"],
        said: [
          {
            ...broken("asked-1", "walk-1"),
            from: "person",
            isFailure: false,
          },
        ],
      },
    },
  };
}

describe("walkMachine · the record writes the question first", () => {
  it("counts the walk as going while the question is being written, so no second question enters", () => {
    assert.equal(isWalking(putToEditor()), true);
  });

  it("puts the first turn out once the question is in the record", () => {
    const { state, effects } = walkMachine(
      putToEditor(),
      {
        kind: "questionWritten",
        runKey: "walk-1",
      },
      config([agent("editor")]),
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["askMachine"],
    );
    // The turn names the question it works under, whose shared memory it may be given.
    assert.partialDeepStrictEqual(effects[0], {
      questionId: "question-1",
    });
    assert.deepEqual(Object.keys(state.out), ["turn-1"]);
  });

  it("puts nothing out of a walk stopped while its question was being written, and lets it end", () => {
    const stopped = walkMachine(
      putToEditor(),
      {
        kind: "stopped",
        runKey: null,
      },
      config([agent("editor")]),
    ).state;
    const { effects } = walkMachine(
      stopped,
      {
        kind: "questionWritten",
        runKey: "walk-1",
      },
      config([agent("editor")]),
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["turnBack"],
    );
  });

  it("says on the question's card what the record answered, keeps the turn for the repeat, and lets the walk go", () => {
    const { state, effects } = walkMachine(
      withPersonCard(putToEditor()),
      {
        kind: "questionUnsaved",
        runKey: "walk-1",
        failure: "SQLITE_FULL: database or disk is full",
      },
      config([agent("editor")]),
    );

    assert.equal(state.walks["walk-1"].said[0].note, `${RECORD_UNSAVED_NOTE} · SQLITE_FULL: database or disk is full`);
    assert.equal(state.walks["walk-1"].unsavedAsk?.turnId, "turn-1");
    assert.equal(isWalking(state), false);
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["dropWalk"],
    );
  });

  it("puts the same question to the record again from its card, holding the turn as before", () => {
    const refused = walkMachine(
      withPersonCard(putToEditor()),
      {
        kind: "questionUnsaved",
        runKey: "walk-1",
        failure: "SQLITE_FULL: database or disk is full",
      },
      config([agent("editor")]),
    ).state;
    const { state, effects } = walkMachine(
      refused,
      {
        kind: "sayAgain",
        said: refused.walks["walk-1"].said[0],
      },
      config([agent("editor")]),
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["openWalk"],
    );
    // The files it was sent with go to the record again with it.
    assert.partialDeepStrictEqual(effects[0], {
      attached: [NOTES],
    });
    assert.equal(state.walks["walk-1"].heldAsk?.turnId, "turn-1");
    assert.equal(state.walks["walk-1"].said[0].note, null);
  });
});

describe("walkMachine · the record writes a step before its lines go out", () => {
  const lines = config([agent("editor"), agent("shortener")], [["editor", "shortener"]]);

  /** The editor's turn back in a walk the writer holds, its card said in the stream. */
  function answeredEditor(): WalkState {
    const { state } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
        ledgers: {
          "walk-1": ledger(),
        },
      }),
      back("editor"),
      lines,
    );

    return {
      ...state,
      walks: {
        "walk-1": {
          ...state.walks["walk-1"],
          said: [broken("said-1", "walk-1")],
        },
      },
    };
  }

  it("holds the lines while the step is being written, and the walk counts as going", () => {
    const state = answeredEditor();

    assert.deepEqual(Object.keys(state.walks["walk-1"].heldTurns), ["said-1"]);
    assert.equal(isWalking(state), true);
  });

  it("takes the lines out once the step is in the record, and counts the turn back", () => {
    const { state, effects } = walkMachine(
      answeredEditor(),
      {
        kind: "stepWritten",
        runKey: "walk-1",
        saidId: "said-1",
      },
      lines,
    );

    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["sayHandoff", "askAgent", "turnBack"],
    );
    assert.deepEqual(state.walks["walk-1"].heldTurns, {});
  });

  it("stops the walk at a step the record refused: its card says why, and the writer lets the walk go", () => {
    const { state, effects } = walkMachine(
      answeredEditor(),
      {
        kind: "stepUnsaved",
        runKey: "walk-1",
        saidId: "said-1",
        failure: "NOT NULL constraint failed: run_calls.source",
      },
      lines,
    );

    assert.equal(
      state.walks["walk-1"].said[0].note,
      `${RECORD_UNSAVED_NOTE} · NOT NULL constraint failed: run_calls.source`,
    );
    assert.deepEqual(stoppedWalks(state), ["walk-1"]);
    assert.deepEqual(
      effects.map((effect) => effect.kind),
      ["dropWalk"],
    );
  });
});

describe("walkMachine · the record's word beside the card's own", () => {
  it("keeps what the card said of itself and puts the record's word after it, once", () => {
    const stopped: WalkState = walk({
      walks: {
        "walk-1": held({
          said: [
            {
              ...broken("said-1", "walk-1"),
              note: "Зупинено",
            },
          ],
          heldTurns: {
            "said-1": back("editor"),
          },
        }),
      },
    });
    const refused = walkMachine(
      stopped,
      {
        kind: "stepUnsaved",
        runKey: "walk-1",
        saidId: "said-1",
        failure: "database is locked",
      },
      NO_LINES,
    ).state;
    const { state } = walkMachine(
      refused,
      {
        kind: "recordUnread",
        saidId: "said-1",
        failure: "database is locked",
      },
      NO_LINES,
    );

    assert.equal(refused.walks["walk-1"].said[0].note, `Зупинено · ${RECORD_UNSAVED_NOTE} · database is locked`);
    assert.equal(state.walks["walk-1"].said[0].note, `Зупинено · ${RECORD_UNREAD_NOTE} · database is locked`);
  });
});

describe("walkMachine · the record refuses to stamp a walk's end", () => {
  /** A walk whose last word is the editor's card. */
  function closing(): WalkState {
    return walk({
      walks: {
        "walk-1": held({
          said: [broken("said-1", "walk-1")],
        }),
      },
    });
  }

  it("says so under the walk's last word, and the repeat stamps the end again", () => {
    const refused = walkMachine(
      closing(),
      {
        kind: "closeUnsaved",
        runKey: "walk-1",
        closing: {
          runId: "run-1",
          endedAt: 900,
        },
        failure: "database is locked",
      },
      NO_LINES,
    ).state;
    const { effects } = walkMachine(
      refused,
      {
        kind: "sayAgain",
        said: refused.walks["walk-1"].said[0],
      },
      NO_LINES,
    );

    assert.equal(refused.walks["walk-1"].said[0].note, `${RECORD_UNCLOSED_NOTE} · database is locked`);
    assert.deepEqual(effects, [
      {
        kind: "closeAgain",
        runKey: "walk-1",
        closing: {
          runId: "run-1",
          endedAt: 900,
        },
      },
    ]);
  });

  it("takes the word back once the end is stamped", () => {
    const refused = walkMachine(
      closing(),
      {
        kind: "closeUnsaved",
        runKey: "walk-1",
        closing: {
          runId: "run-1",
          endedAt: 900,
        },
        failure: "database is locked",
      },
      NO_LINES,
    ).state;
    const { state } = walkMachine(
      refused,
      {
        kind: "walkClosed",
        runKey: "walk-1",
      },
      NO_LINES,
    );

    assert.equal(state.walks["walk-1"].said[0].note, null);
    assert.equal(state.walks["walk-1"].unclosed, null);
  });
});

describe("walkMachine · the record unread for a repeat", () => {
  it("says so under the pressed card and stands the repeat there again", () => {
    const pressed = walk({
      walks: {
        "walk-1": held({
          said: [broken("said-1", "walk-1")],
        }),
      },
      saidAgain: ["said-1"],
    });
    const { state } = walkMachine(
      pressed,
      {
        kind: "recordUnread",
        saidId: "said-1",
        failure: "SQLITE_CANTOPEN: unable to open database file",
      },
      NO_LINES,
    );

    assert.equal(
      state.walks["walk-1"].said[0].note,
      `${RECORD_UNREAD_NOTE} · SQLITE_CANTOPEN: unable to open database file`,
    );
    assert.deepEqual(state.saidAgain, []);
  });
});
