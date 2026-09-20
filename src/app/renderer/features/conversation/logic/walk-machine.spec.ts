import { describe, expect, it } from "vitest";
import { begunWalk } from "./begun-walk";
import { emptyWalk } from "./empty-walk";
import { walkMachine } from "./walk-machine";
import type { Agent, Link, ProjectConfig } from "../../../interfaces";
import type { RunUnfinished } from "../../record";
import { RUN_STEP_DONE, RUN_STEP_FAILED } from "../../record";
import type {
  ChatMessage,
  IncomingWork,
  RunLedger,
  TurnAnswer,
  TurnOut,
  WaitedWork,
  Walk,
  WalkEvent,
  WalkState,
} from "../interfaces";
import { aConfig, anAgent } from "../../../testing";

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
  };
}

function work(fromAgentId: string): IncomingWork {
  return {
    text: `from ${fromAgentId}`,
    cost: null,
    fromAgentId,
    fromStepIds: [],
    seconds: 1,
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

/** The turns out, each under its own id — the shape the walk holds them in. */
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

/** One turn come back; what it says is set by the patch, and everything else is a plain good answer. */
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
    ...patch,
  };
}

/** The turn of one agent that came back, as the machine is told of it. */
function back(agentId: string, patch: Partial<TurnAnswer> = {}): Extract<WalkEvent, { kind: "answered" }> {
  return {
    kind: "answered",
    agent: agent(agentId),
    turnId: "turn-1",
    runKey: "walk-1",
    incoming: [question()],
    startAgentId: agentId,
    asked: "Прогони тести",
    answer: answer(patch),
    saidId: "said-1",
    startedAt: 100,
    endedAt: 1100,
  };
}

/** The row «СПИТАТИ ЩЕ РАЗ» stands under — a turn of one walk that ended in anything but an answer. */
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

/** One walk as the machine holds it, with what a spec puts into it. */
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

/** A stream holding one walk, «walk-1», unless the spec says otherwise — a rule is told of walks it holds. */
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

    expect(stoppedWalks(state)).toEqual(["walk-1"]);
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

    expect(effects).toEqual([
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

    expect(stoppedWalks(state)).toEqual(["walk-1", "walk-2"]);
  });

  it("leaves the walk untouched by an event it has no rule for yet", () => {
    const standing = walk();

    expect(
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
    ).toEqual({
      state: standing,
      effects: [],
    });
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

    expect(state.walks["walk-1"]?.runId).toBe("run-1");
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

    expect(state.walks["walk-1"]?.runId).toBe("run-1");
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

    expect(putAwayWalks(state)).toEqual(["walk-0", "walk-1", "walk-2"]);
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

    // A walk still out keeps every word it said — its run holds them when it is opened again.
    expect(state.walks["walk-1"]?.said).toEqual([]);
    // Every other stream keeps what stands typed in it.
    expect(state.drafts).toEqual({
      "stream-2": "Інший стрім",
    });
    expect(state.flowRunId).toBeNull();
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

    expect(state.walks).toEqual({});
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

    expect(Object.keys(state.walks)).toEqual(["walk-1"]);
    expect(Object.keys(state.walks["walk-1"].waiting)).toEqual(["reviewer"]);
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

    expect(state.walks["walk-1"]?.waiting.titler?.settledIds).toEqual(["thesaurus"]);
    expect(state.walks["walk-1"]?.waiting.titler?.arrived).toHaveLength(1);
    expect(effects).toEqual([]);
  });

  it("puts everything the point gathered to the agent when the last supplier has been", () => {
    const stood: WaitedWork = {
      startAgentId: "thesaurus",
      awaitedIds: awaited,
      settledIds: ["thesaurus"],
      arrived: [work("thesaurus")],
      viaLinkIds: ["link-1"],
      isAwaitingRepeat: false,
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

    expect(state.walks["walk-1"]?.waiting.titler).toBeUndefined();
    expect(effects).toEqual([
      {
        kind: "askAgent",
        agent: point,
        incoming: [work("thesaurus"), work("shortener")],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-1", "link-2"],
        runKey: "walk-1",
        isAgain: false,
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

    expect(state.walks["walk-1"]?.waiting.titler).toBeUndefined();
    expect(effects).toEqual([
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

    expect(state.walks["walk-1"]?.waiting.titler?.isAwaitingRepeat).toBe(true);
    expect(effects).toEqual([]);
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

    // Nobody was waiting on a single line, so the walk simply runs to its end and nothing is asked.
    expect(state.walks["walk-1"]?.waiting ?? {}).toEqual({});
    expect(effects).toEqual([]);
  });

  it("settles a converging point with nothing, and the point lets down whoever stands behind it", () => {
    // The point waits for both only where the run reaches both: the walk out of the thesaurus goes to the shortener too.
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

    expect(state.walks["walk-1"]?.waiting.titler).toBeUndefined();
    expect(effects).toEqual([
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

    expect(state.walks["walk-1"]?.waiting ?? {}).toEqual({});
    expect(effects).toEqual([]);
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

    expect(effects).toEqual([]);
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

    expect(effects.filter((effect) => effect.kind === "sayHandoff")).toHaveLength(2);
  });

  it("puts the work to an agent standing alone the moment it arrives", () => {
    const { effects } = handedOn([
      {
        linkId: "link-0",
        to: shortener,
        stopReason: null,
      },
    ]);

    expect(effects.filter((effect) => effect.kind === "askAgent")).toEqual([
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
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-0"],
        runKey: "walk-1",
        isAgain: false,
      },
    ]);
  });

  it("holds the work at a converging point instead of putting it, and asks nobody yet", () => {
    const { state, effects } = handedOn([
      {
        linkId: "link-1",
        to: titler,
        stopReason: null,
      },
    ]);

    expect(state.walks["walk-1"]?.waiting.titler?.arrived).toHaveLength(1);
    expect(state.walks["walk-1"]?.waiting.titler?.settledIds).toEqual(["thesaurus"]);
    expect(effects.filter((effect) => effect.kind === "askAgent")).toEqual([]);
  });

  it("lets down whoever waited behind a line that could not be taken", () => {
    // The work never goes there, so the point below settles that supplier with nothing in hand.
    const { state, effects } = handedOn([
      {
        linkId: "link-0",
        to: shortener,
        stopReason: "off",
      },
    ]);

    expect(state.walks["walk-1"]?.waiting.titler?.settledIds).toEqual(["shortener"]);
    expect(state.walks["walk-1"]?.waiting.titler?.arrived).toEqual([]);
    // Nothing is put anywhere: the row about the line is all this hand-off does.
    expect(effects.map((effect) => effect.kind)).toEqual(["sayHandoff"]);
  });

  it("settles a converging point with nothing from a line it could not take, so it goes on without that supplier", () => {
    // A supplier whose line the walk could not take never answers, so a point that waited on it would wait
    // for ever; it is settled with nothing from that line and works on what did arrive.
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

    // Nothing goes down that line ever — the point counts this supplier as settled with empty hands.
    expect(first.state.walks["walk-2"].waiting.titler?.settledIds).toEqual(["thesaurus"]);
    expect(first.state.walks["walk-2"].waiting.titler?.arrived).toEqual([]);

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

    expect(second.state.walks["walk-2"].waiting.titler).toBeUndefined();
    expect(second.effects.filter((effect) => effect.kind === "askAgent").map((effect) => effect.incoming)).toEqual([
      [
        {
          text: "Стисло",
          cost: null,
          fromAgentId: "shortener",
          fromStepIds: [],
          seconds: 2,
        },
      ],
    ]);
  });

  it("never closes another walk's wait: two walks converging on one point hold two waits", () => {
    // One agent may be a point in two walks at once, and each wait is that walk's own — a supplier
    // settling in one of them says nothing about the other.
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

    // Walk-1's point stands exactly as it stood: its shortener is still to come.
    expect(state.walks["walk-1"].waiting.titler).toEqual(standing.walks["walk-1"].waiting.titler);
    // Walk-2's point settled both — the shortener with nothing, the thesaurus with words — and went, in walk-2.
    expect(state.walks["walk-2"].waiting.titler).toBeUndefined();
    expect(effects.filter((effect) => effect.kind === "askAgent")).toEqual([
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
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-1"],
        runKey: "walk-2",
        isAgain: false,
      },
    ]);
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
        turnId: "turn-1",
        startedAt: 100,
        ...patch,
      },
      NO_LINES,
    );
  }

  it("puts the turn out and marks the agent as working", () => {
    const { state, effects } = asked();

    expect(state.out["turn-1"]?.agentId).toBe("editor");
    expect(effects.map((effect) => effect.kind)).toEqual(["sayAsked", "askMachine"]);
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

    expect(state.out).toEqual({});
    expect(effects).toEqual([]);
  });

  it("begins nothing where nothing came", () => {
    const { effects } = asked({
      incoming: [],
    });

    expect(effects).toEqual([]);
  });

  it("stands a person's question aimed at an agent switched off in the stream, with the row saying why it stayed", () => {
    const { state, effects } = asked({
      agent: {
        ...editor,
        isActive: false,
      },
    });

    // The question is the person's, so it is said; nothing of it goes out, and the walk is over at once.
    expect(state.out).toEqual({});
    expect(effects).toEqual([
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
    // Working is no wall — the agent takes a turn for every walk asking it.
    const { state, effects } = asked(
      {},
      walk({
        out: working(turn("turn-0", "editor", "walk-0")),
      }),
    );

    expect(Object.keys(state.out).sort()).toEqual(["turn-0", "turn-1"]);
    expect(effects.map((effect) => effect.kind)).toEqual(["sayAsked", "askMachine"]);
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

    expect(stoppedWalks(state)).toEqual(["walk-1", "walk-2"]);
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

    expect(stoppedWalks(state)).toEqual([]);
    expect(effects).toEqual([]);
  });

  it("cuts the walks of the row on screen and leaves another conversation running", () => {
    // Two conversations at once. The button under the field speaks for the stream it stands in, and the
    // work of the other row is neither cut nor asked to stop — it was paid for and nobody pressed anything on it.
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

    expect(stoppedWalks(state)).toEqual(["walk-1"]);
    expect(effects).toEqual([
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

    expect(effects).toEqual([
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

  function whole(left: RunUnfinished, state = walk(), notSentTo: string | null = null, drawn = lines) {
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
      },
      drawn,
    );
  }

  /** A repeat run against other lines than the whole ones — an agent switched off among them. */
  function repeatedIn(left: RunUnfinished, drawn: ProjectConfig) {
    const next = whole(left, walk(), null, drawn);

    return {
      state: next.state,
      effects: next.effects.filter((effect) => effect.kind !== "takeWalk"),
    };
  }

  /** Every repeat takes its walk first; that one effect has its own spec, and the rest read without it. */
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

    expect(effects[0]).toEqual({
      kind: "takeWalk",
      runKey: "walk-2",
      // The repeat is no question of the person's, so it stands in the block of the one it picks up.
      askedAt: 100,
      runId: "run-1",
      questionId: "question-1",
    });
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

    expect(effects).toEqual([
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
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: [],
        runKey: "walk-2",
        isAgain: true,
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
        },
      ],
    });

    expect(effects).toEqual([
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
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: ["link-0"],
        runKey: "walk-2",
        isAgain: false,
      },
    ]);
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
    expect(effects).toEqual([
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

    expect(effects).toEqual([
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
          },
        ],
        startAgentId: "thesaurus",
        viaLinkIds: [],
        runKey: "walk-2",
        isAgain: true,
      },
    ]);
  });
});

describe("walkMachine · the words of a walk picked up", () => {
  it("names a repeat as a repeat, so the words already standing in the stream are not said twice", () => {
    // The repeat picks the walk up; its question stands right above it and is not asked again.
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
      },
      config([agent("editor")]),
    );

    expect(effects.filter((effect) => effect.kind === "askAgent").map((effect) => effect.isAgain)).toEqual([true]);
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

    expect(state.out).toEqual({});
  });

  it("takes the lines out of an answer and hands the words on down each of them", () => {
    const { effects } = walkMachine(
      walk({
        out: working(turn("turn-1", "editor", "walk-1")),
      }),
      back("editor"),
      config([agent("editor"), agent("shortener")], [["editor", "shortener"]]),
    );

    expect(effects.map((effect) => effect.kind)).toEqual(["sayAnswer", "sayHandoff", "askAgent"]);
  });

  it("hands the words down no line that leads back into the walk's own path", () => {
    // A ring got past the drawing and past the file — the machine is the last wall between the work and a
    // walk without end.
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

    expect(effects.map((effect) => effect.kind)).toEqual(["sayAnswer"]);
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

    expect(stoppedWalks(state)).toEqual(["walk-1"]);
    expect(effects.map((effect) => effect.kind)).toEqual(["sayAnswer"]);
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

    expect(state.drafts).toEqual({
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

    expect(effects.map((effect) => effect.kind)).toEqual(["sayAnswer", "writeTurn", "turnBack"]);
  });

  it("writes the provider's sentence down for a turn that fell, and makes no card of it", () => {
    // The record keeps what came back, so the run opened tomorrow says why it fell; the card holds the model's
    // own words alone, and a refusal is not the model speaking.
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

    expect(written?.kind === "writeTurn" && written.turn.said).toBe("404 page not found");
    expect(card?.kind === "sayAnswer" && card.turn.said).toBe("");
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
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );

    expect(effects.map((effect) => effect.kind)).toEqual(["openWalk", "sayAsked", "askMachine"]);
    expect(effects[0]).toEqual({
      kind: "openWalk",
      runKey: "walk-1",
      questionId: "question-1",
      askedAt: 100,
      // The row this walk writes into is the conversation's, and it is older than the walk.
      runId: "run-1",
      // The row is named by the agent it began with, so the agent goes whole, not its id alone.
      agent: agent("editor"),
      asked: "Прогони тести",
    });
  });

  it("stands every word of the walk in the block of the question, at the hour it was asked", () => {
    const { effects } = walkMachine(
      walk(),
      {
        kind: "put",
        agent: agent("editor"),
        text: "Прогони тести",
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

    expect(saying.kind === "sayAsked" && saying.askedAt).toBe(100);
  });

  it("puts nothing while a turn of this stream is out: a conversation walks one walk at a time", () => {
    // The hand under the field is «ЗУПИНИТИ» while something is out, so no second question is sent into
    // the same conversation. Another conversation is «+ НОВИЙ ЧАТ», and it walks beside this one.
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
        fedFrom: [],
        isAgain: false,
        questionId: "question-2",
        runKey: "walk-2",
        askedAt: 200,
        turnId: "turn-2",
      },
      config([agent("editor")]),
    );

    expect(state.walks["walk-2"]).toBeUndefined();
    expect(effects).toEqual([]);
  });

  it("puts the question where the turn out belongs to another conversation, standing on another row", () => {
    // That walk is not of this screen, so it is no wall here — this row has nothing out of its own.
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
        fedFrom: [],
        isAgain: false,
        questionId: "question-2",
        runKey: "walk-2",
        askedAt: 200,
        turnId: "turn-2",
      },
      config([agent("editor")]),
    );

    expect(effects.some((effect) => effect.kind === "askMachine")).toBe(true);
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
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );

    // The pill goes; the walk itself stays, because its words are the stream on screen.
    expect(state.walks["walk-gone"]?.waiting).toEqual({});
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
        fedFrom: [],
        isAgain: false,
        questionId: "question-1",
        runKey: "walk-1",
        askedAt: 100,
        turnId: "turn-1",
      },
      config([agent("editor")]),
    );

    expect(Object.keys(state.walks["walk-old"].waiting)).toEqual(["headliner"]);
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

    expect(state.saidAgain).toEqual(["said-1"]);
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

    expect(effects).toEqual([
      {
        kind: "askAgain",
        runId: "run-1",
        questionId: "question-1",
        walkId: "walk-1",
        notSentTo: null,
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

    expect(asking.kind === "askAgain" && asking.notSentTo).toBe("editor");
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

    expect(effects).toEqual([]);
  });
});
