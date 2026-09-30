import { awaitedSuppliers } from "./awaited-suppliers";
import { begunWalk } from "./begun-walk";
import { fedStepIds } from "./fed-step-ids";
import { cannotTake, linkOuts } from "./link-outs";
import { askedWithAttached } from "./asked-with-attached";
import { handedWork } from "./handed-work";
import { isOnScreen } from "./is-on-screen";
import { isWalking } from "./is-walking";
import { isWaitOver, settledWait } from "./settled-wait";
import { forgotten } from "../../../utils/records";
import { tidyAnswer } from "../../../utils/text";
import { MS_IN_SECOND } from "../../../utils/dates/constants";
import type { ProjectConfig } from "../../../interfaces";
import type { IncomingWork, LineNotTaken, LinkOut, RunLedger, Walk } from "../interfaces";
import type { WalkEffect, WalkEvent, WalkFact, WalkNext, WalkRule, WalkRules, WalkState } from "../interfaces";

/** Each fact kind names its rule; every kind appears exactly once, so an unanswered fact does not compile. */
const WALK_RULES: WalkRules = {
  answered,
  asked,
  handedOn,
  put,
  putAway,
  released,
  repeated,
  rowOpened,
  sayAgain,
  settled,
  stopped: (state, event) => cutWalks(state, event.runKey),
};

/**
 * The walk itself: given an event and the drawn lines, yields the new walk state and the effects it asks for. Touches
 * no provider, record or React.
 */
export function walkMachine(state: WalkState, event: WalkEvent, config: ProjectConfig): WalkNext {
  return (<WalkRule<WalkEvent["kind"]>>WALK_RULES[event.kind])(state, event, config);
}

/**
 * The stream was emptied: every walk still out is put away (runs to its end, writes its record, its words go with it),
 * and what was typed goes with the stream.
 */
function putAway(state: WalkState, event: WalkFact<"putAway">): WalkNext {
  return {
    state: {
      ...state,
      walks: Object.fromEntries(
        Object.entries(state.walks)
          .filter(([runKey]) => state.ledgers[runKey] !== undefined)
          .map(([runKey, walk]) => [
            runKey,
            {
              ...walk,
              isPutAway: true,
            },
          ]),
      ),
      drafts: Object.fromEntries(Object.entries(state.drafts).filter(([held]) => held !== event.stream)),
      flowRunId: null,
    },
    effects: [],
  };
}

/**
 * Cuts a broken or stopped walk, or every walk of this stream when none is named. The end is marked before any turn is
 * stopped; a walk put away is not included.
 */
function cutWalks(state: WalkState, runKey: string | null): WalkNext {
  const cut = new Set(runKey === null ? everyWalk(state) : [runKey]);

  return {
    state: {
      ...state,
      walks: Object.fromEntries(
        Object.entries(state.walks).map(([held, walk]) => [
          held,
          cut.has(held)
            ? {
                ...walk,
                isStopped: true,
              }
            : walk,
        ]),
      ),
    },
    effects: Object.values(state.out)
      .filter((turn) => cut.has(turn.runKey))
      .map((turn) => ({
        kind: "stopMachine",
        turnId: turn.turnId,
      })),
  };
}

/**
 * Every walk of the stream on screen, those the button speaks for; a walk writing into another row is another
 * conversation.
 */
function everyWalk(state: WalkState): string[] {
  return Object.keys(state.walks).filter((runKey) => isOnScreen(state, runKey));
}

/** The walk's question opened a row and the walk writes into it from now on; a walk that knows its row keeps it. */
function rowOpened(state: WalkState, event: WalkFact<"rowOpened">): WalkNext {
  const walk = state.walks[event.runKey];

  if (walk === undefined || walk.runId !== null) {
    return {
      state,
      effects: [],
    };
  }

  return {
    state: withWalk(state, event.runKey, {
      ...walk,
      runId: event.runId,
    }),
    effects: [],
  };
}

/**
 * Drops the waits (and their pills) of walks that are over once a new walk begins; the walks themselves stay, their
 * words being the stream on screen.
 */
function withoutOverWaits(state: WalkState): Record<string, Walk> {
  return Object.fromEntries(
    Object.entries(state.walks).map(([runKey, walk]) => [
      runKey,
      state.ledgers[runKey] === undefined
        ? {
            ...walk,
            waiting: {},
          }
        : walk,
    ]),
  );
}

/** One walk replaced, found by its own id. */
function withWalk(state: WalkState, runKey: string, walk: Walk): WalkState {
  return {
    ...state,
    walks: {
      ...state.walks,
      [runKey]: walk,
    },
  };
}

/**
 * One supplier of a converging point has had its turn. While another is to come the point holds what arrived; after the
 * last it works, or with empty hands lets down whoever waits.
 */
function settled(state: WalkState, event: WalkFact<"settled">): WalkNext {
  // The wait is the walk's own: found by the walk, then by the point in it.
  const walk = state.walks[event.runKey];

  if (walk === undefined) {
    return {
      state,
      effects: [],
    };
  }

  const standing = walk.waiting[event.to.id] ?? {
    startAgentId: event.startAgentId,
    awaitedIds: event.awaited,
    settledIds: [],
    arrived: [],
    viaLinkIds: [],
    isAwaitingRepeat: false,
    // A point that does not wait keeps a tally, not a wait, and is drawn no pill.
    isSilent: !event.to.waitsForAll,
  };
  const stood = settledWait(standing, {
    fromId: event.fromId,
    work: event.work,
    via: event.via,
    isBroken: walk.isStopped,
  });

  // A point that does not wait sends each arrival on at once; the tally only tells, after every supplier settled,
  // whether anything came.
  if (!event.to.waitsForAll) {
    const sent: WalkEffect[] =
      event.work === null
        ? []
        : [
            {
              kind: "askAgent",
              agent: event.to,
              incoming: [event.work],
              startAgentId: event.startAgentId,
              viaLinkIds: event.via === null ? [] : [event.via],
              runKey: event.runKey,
              isAgain: false,
            },
          ];

    if (!isWaitOver(stood)) {
      return {
        state: withWalk(state, event.runKey, {
          ...walk,
          waiting: {
            ...walk.waiting,
            [event.to.id]: stood,
          },
        }),
        effects: sent,
      };
    }

    const cleared = withWalk(state, event.runKey, {
      ...walk,
      waiting: forgotten(walk.waiting, event.to.id),
    });

    // Nothing arrived: no work here or behind this agent, so whoever waited is let down.
    if (stood.arrived.length === 0) {
      return {
        state: cleared,
        effects: [
          {
            kind: "letDown",
            fromId: event.to.id,
            startAgentId: event.startAgentId,
            runKey: event.runKey,
          },
        ],
      };
    }

    return {
      state: cleared,
      effects: sent,
    };
  }

  if (!isWaitOver(stood)) {
    return {
      state: withWalk(state, event.runKey, {
        ...walk,
        waiting: {
          ...walk.waiting,
          [event.to.id]: stood,
        },
      }),
      effects: [],
    };
  }

  const released = withWalk(state, event.runKey, {
    ...walk,
    waiting: forgotten(walk.waiting, event.to.id),
  });

  // Nothing arrived: no work here or behind this agent.
  if (stood.arrived.length === 0) {
    return {
      state: released,
      effects: [
        {
          kind: "letDown",
          fromId: event.to.id,
          startAgentId: event.startAgentId,
          runKey: event.runKey,
        },
      ],
    };
  }

  return {
    state: released,
    effects: [
      {
        kind: "askAgent",
        agent: event.to,
        incoming: stood.arrived,
        startAgentId: event.startAgentId,
        viaLinkIds: stood.viaLinkIds,
        runKey: event.runKey,
        isAgain: false,
      },
    ],
  };
}

/**
 * An agent that will not answer in this run lets down whoever waited on it; the release passes through a
 * single-supplier point and settles a converging point's supplier with nothing.
 */
function released(state: WalkState, event: WalkFact<"released">, config: ProjectConfig): WalkNext {
  const effects: WalkEffect[] = [];
  const walked = new Set<string>();
  let standing = state;

  const walk = (atId: string) => {
    if (walked.has(atId)) {
      return;
    }

    walked.add(atId);

    for (const link of config.links.filter((standing) => standing.from === atId)) {
      const to = config.agents.find((agent) => agent.id === link.to) ?? null;

      if (to === null || !to.isActive) {
        continue;
      }

      const awaited = awaitedSuppliers(config, event.startAgentId, to.id);

      // Nobody was waiting on this line; nothing to release.
      if (!awaited.includes(atId)) {
        continue;
      }

      if (awaited.length < 2) {
        walk(to.id);

        continue;
      }

      const next = settled(standing, {
        kind: "settled",
        to,
        awaited,
        fromId: atId,
        work: null,
        startAgentId: event.startAgentId,
        via: null,
        runKey: event.runKey,
      });

      standing = next.state;
      effects.push(...next.effects);
    }
  };

  walk(event.fromId);

  return {
    state: standing,
    effects,
  };
}

/**
 * A line that could not be taken: nothing goes down it. A converging point at its end settles it with nothing; an agent
 * standing alone lets down whoever waits behind.
 */
function notTaken(state: WalkState, line: LineNotTaken, config: ProjectConfig): WalkNext {
  const { fromId, to, awaited, startAgentId, runKey } = line;

  if (awaited.length < 2) {
    return released(
      state,
      {
        kind: "released",
        fromId: to.id,
        startAgentId,
        runKey,
      },
      config,
    );
  }

  return settled(state, {
    kind: "settled",
    to,
    awaited,
    fromId,
    work: null,
    startAgentId,
    via: null,
    runKey,
  });
}

/**
 * The answer's lines go out: each link says its own row, taken or not, and hands the work on: at once to an agent
 * alone, as one supplier's wait to a converging point, never down an untaken link.
 */
function handedOn(state: WalkState, event: WalkFact<"handedOn">, config: ProjectConfig): WalkNext {
  const effects: WalkEffect[] = [];
  const walk = state.walks[event.runKey];
  let standing = state;

  // An unknown walk hands nothing on; standing still says so.
  if (walk === undefined) {
    return {
      state,
      effects,
    };
  }

  for (const { linkId, to, stopReason } of event.out) {
    effects.push({
      kind: "sayHandoff",
      runKey: event.runKey,
      fromAgentId: event.from.id,
      toAgentId: to.id,
      stopReason,
      questionId: walk.questionId,
      askedAt: walk.askedAt,
    });

    const awaited = awaitedSuppliers(config, event.startAgentId, to.id);

    if (stopReason !== null) {
      const next = notTaken(
        standing,
        {
          fromId: event.from.id,
          to,
          awaited,
          startAgentId: event.startAgentId,
          runKey: event.runKey,
        },
        config,
      );

      standing = next.state;
      effects.push(...next.effects);

      continue;
    }

    const work: IncomingWork = {
      text: event.text,
      cost: event.cost,
      fromAgentId: event.from.id,
      fromStepIds: [],
      seconds: event.seconds,
      attached: [],
    };

    // One live supplier is not a converging point: the work goes in as it arrives.
    if (awaited.length < 2) {
      effects.push({
        kind: "askAgent",
        agent: to,
        incoming: [work],
        startAgentId: event.startAgentId,
        viaLinkIds: [linkId],
        runKey: event.runKey,
        isAgain: false,
      });

      continue;
    }

    const next = settled(standing, {
      kind: "settled",
      to,
      awaited,
      fromId: event.from.id,
      work,
      startAgentId: event.startAgentId,
      via: linkId,
      runKey: event.runKey,
    });

    standing = next.state;
    effects.push(...next.effects);
  }

  return {
    state: standing,
    effects,
  };
}

/**
 * The person put a question. The walk begins with the question written down, even if it reaches nobody, and the waits
 * of walks that are over are let down.
 */
function put(state: WalkState, event: WalkFact<"put">): WalkNext {
  // One walk at a time per conversation: while a turn of this stream is out, the button is «ЗУПИНИТИ» and nothing is
  // sent; another conversation is «+ НОВИЙ ЧАТ».
  if (isWalking(state)) {
    return {
      state,
      effects: [],
    };
  }

  const standing: WalkState = {
    ...state,
    walks: {
      ...withoutOverWaits(state),
      [event.runKey]: begunWalk(event.questionId, event.askedAt, state.flowRunId),
    },
  };
  const asking = asked(standing, {
    kind: "asked",
    agent: event.agent,
    incoming: [
      {
        text: event.text,
        cost: null,
        fromAgentId: null,
        fromStepIds: event.fedFrom,
        seconds: null,
        // Attached files ride with the person's words into the turn; the stream shows neither.
        attached: event.attached,
      },
    ],
    startAgentId: event.agent.id,
    viaLinkIds: [],
    runKey: event.runKey,
    isAgain: event.isAgain,
    turnId: event.turnId,
    startedAt: event.askedAt,
  });

  return {
    state: asking.state,
    effects: [
      {
        kind: "openWalk",
        runKey: event.runKey,
        questionId: event.questionId,
        askedAt: event.askedAt,
        // The row this walk writes into is the conversation's, older than the walk once one was asked.
        runId: state.flowRunId,
        // The row is named by the agent it began with, as it stands now.
        agent: event.agent,
        asked: event.text,
      },
      ...asking.effects,
    ],
  };
}

/**
 * Work was put to an agent. A stopped walk begins nothing; a switched-off agent takes nothing and the question stays,
 * said aloud. Other work the agent is doing is no wall.
 */
function asked(state: WalkState, event: WalkFact<"asked">): WalkNext {
  const [first] = event.incoming;

  if (first === undefined || state.walks[event.runKey]?.isStopped === true) {
    return {
      state,
      effects: [],
    };
  }

  const walk = state.walks[event.runKey];

  if (walk === undefined) {
    return {
      state,
      effects: [],
    };
  }

  const saying = wordsGiven(event, walk);

  /**
   * Only the person's question reaches a switched-off agent; work down a line stops at the link. The words stand in the
   * stream with the row saying why they stayed, and the walk ends before it began.
   */
  if (!event.agent.isActive) {
    return {
      state,
      effects: [
        saying,
        {
          kind: "sayHandoff",
          runKey: event.runKey,
          fromAgentId: null,
          toAgentId: event.agent.id,
          stopReason: "off",
          questionId: walk.questionId,
          askedAt: walk.askedAt,
        },
        {
          kind: "turnBack",
          runKey: event.runKey,
        },
      ],
    };
  }

  return {
    state: {
      ...state,
      out: {
        ...state.out,
        [event.turnId]: {
          turnId: event.turnId,
          agentId: event.agent.id,
          startedAt: event.startedAt,
          viaLinkIds: event.viaLinkIds,
          runKey: event.runKey,
        },
      },
    },
    effects: [saying, turnPut(event, first)],
  };
}

/** The words a turn was given, said in the stream: the person's own, or what arrived down each line. */
function wordsGiven(event: WalkFact<"asked">, walk: Walk): WalkEffect {
  return {
    kind: "sayAsked",
    runKey: event.runKey,
    agentId: event.agent.id,
    incoming: event.incoming,
    // Every word of the walk stands in the block of the question that began it.
    questionId: walk.questionId,
    askedAt: walk.askedAt,
    isAgain: event.isAgain,
  };
}

/** The turn itself, put to the provider with the words it works on. */
function turnPut(event: WalkFact<"asked">, first: IncomingWork): WalkEffect {
  return {
    kind: "askMachine",
    agent: event.agent,
    turnId: event.turnId,
    incoming: event.incoming,
    startAgentId: event.startAgentId,
    viaLinkIds: event.viaLinkIds,
    runKey: event.runKey,
    isAgain: event.isAgain,
    startedAt: event.startedAt,
    // A person's words go in as typed; work that came by a line as it was said.
    asked:
      first.fromAgentId === null
        ? askedWithAttached(first.text, first.attached)
        : handedWork(
            event.incoming.map((one) => ({
              text: one.text,
            })),
          ),
  };
}

/**
 * The turn is back: the agent is free and words stop arriving. Only an answer walks on; a fall, a cut turn or one that
 * never began ends the walk.
 */
function answered(state: WalkState, event: WalkFact<"answered">, config: ProjectConfig): WalkNext {
  const ledger = state.ledgers[event.runKey] ?? null;
  // Every word of the walk stands in the block of the question that began it.
  const walk = state.walks[event.runKey];
  const said = tidyAnswer(event.answer.text);
  // The walk goes on through the agent's own words alone; a fall, a cut turn or one that never began takes no line out.
  const goesOn = !event.answer.isFailure && !event.answer.isCut && event.answer.notStarted === null && said !== "";
  // A question that never went is not given back to the field; it already stands in the stream and record, and the
  // field is free for the next one.
  let standing: WalkState = {
    ...state,
    // The returned turn is forgotten by its own id; another turn of the same agent is not this one.
    out: forgotten(state.out, event.turnId),
  };

  // A turn of a walk the machine does not hold is only forgotten.
  if (walk === undefined) {
    return {
      state: standing,
      effects: [],
    };
  }

  // The lines out of this turn, worked out once from the lines drawn out of the agent.
  const out = goesOn ? linkOuts(config, event.agent) : [];
  const effects: WalkEffect[] = [answerCard(event, walk, ledger, said)];
  // A fallen turn said nothing itself; the provider's sentence is recorded so a later-opened run says why it fell.
  const written = said === "" ? (event.answer.fell ?? "") : said;

  // A turn that never began is a step too, so a walk broken that way survives closing.
  if (ledger !== null) {
    effects.push(writtenStep(event, config, written, out));
  }

  const next = goesOn ? handedOn(standing, handOut(event, said, out), config) : brokeOff(standing, event, config);

  standing = next.state;
  effects.push(...next.effects);

  // Everything this turn set going is going now; if nothing else is out, the walk is over.
  if (ledger !== null) {
    effects.push({
      kind: "turnBack",
      runKey: event.runKey,
    });
  }

  return {
    state: standing,
    effects,
  };
}

/** The card one turn became: what it was asked, what it said, and the steps that fed it. */
function answerCard(event: WalkFact<"answered">, walk: Walk, ledger: RunLedger | null, said: string): WalkEffect {
  return {
    kind: "sayAnswer",
    runKey: event.runKey,
    turn: {
      id: event.saidId,
      agentId: event.agent.id,
      walkId: event.runKey,
      asked: event.asked,
      fedBy: fedStepIds(ledger, event.incoming),
      said,
      // Every word of the walk stands in the block of the question that began it.
      questionId: walk.questionId,
      askedAt: walk.askedAt,
      startedAt: event.startedAt,
      endedAt: event.endedAt,
      answer: event.answer,
    },
  };
}

/** The turn as the record takes it: what it ran with, as it stood then, and where it handed on. */
function writtenStep(event: WalkFact<"answered">, config: ProjectConfig, said: string, out: LinkOut[]): WalkEffect {
  return {
    kind: "writeTurn",
    runKey: event.runKey,
    saidId: event.saidId,
    turn: {
      agent: event.agent,
      model: config.models.find((one) => one.id === event.agent.modelId) ?? null,
      prompt: config.prompts.find((one) => one.id === event.agent.promptId)?.text ?? "",
      asked: event.asked,
      said,
      state: event.answer.state,
      cost: event.answer.cost,
      incoming: event.incoming,
      handoffs: out.map(({ to, stopReason }) => ({
        toAgentId: to.id,
        stopReason,
      })),
      startedAt: event.startedAt,
      // Nothing went, so the turn took no time at all.
      endedAt: event.answer.notStarted === null ? event.endedAt : event.startedAt,
      calls: event.answer.calls,
    },
  };
}

/** The answer as the lines out of it receive it: the words, their cost, and their duration. */
function handOut(event: WalkFact<"answered">, said: string, out: LinkOut[]): WalkFact<"handedOn"> {
  return {
    kind: "handedOn",
    from: event.agent,
    text: said,
    cost: event.answer.cost,
    seconds: Math.round((event.endedAt - event.startedAt) / MS_IN_SECOND),
    startAgentId: event.startAgentId,
    runKey: event.runKey,
    out,
  };
}

/**
 * A turn that answered nothing ends its walk: the walk is marked first so no turn of it begins after, and whoever
 * waited on this agent is let down.
 */
function brokeOff(state: WalkState, event: WalkFact<"answered">, config: ProjectConfig): WalkNext {
  const cut = cutWalks(state, event.runKey);
  const letting = released(
    cut.state,
    {
      kind: "released",
      fromId: event.agent.id,
      startAgentId: event.startAgentId,
      runKey: event.runKey,
    },
    config,
  );

  return {
    state: letting.state,
    effects: [...cut.effects, ...letting.effects],
  };
}

/**
 * «СПИТАТИ ЩЕ РАЗ» pressed under one turn: the act is used up at once and the record is asked for the walk to pick up;
 * a stream without a row has nothing to read.
 */
function sayAgain(state: WalkState, event: WalkFact<"sayAgain">): WalkNext {
  const standing: WalkState = {
    ...state,
    saidAgain: [...state.saidAgain, event.said.id],
  };

  if (state.flowRunId === null) {
    return {
      state: standing,
      effects: [],
    };
  }

  return {
    state: standing,
    effects: [
      {
        kind: "askAgain",
        runId: state.flowRunId,
        questionId: event.said.questionId,
        // The walk names the question, not the hour; two questions can differ by milliseconds, and a repeat under the
        // wrong words is worse than none.
        walkId: event.said.walkId,
        notSentTo: event.said.from === "notSent" ? event.said.otherAgentId : null,
      },
    ],
  };
}
/**
 * A question's walk picked up where it broke: the walk begins again, unconsumed arrivals go in, a question that never
 * went is put, and every turn that did not answer runs again word for word.
 */
function repeated(state: WalkState, event: WalkFact<"repeated">, config: ProjectConfig): WalkNext {
  const begun = pickedUp(state, event);
  const arrived = workThatArrived(begun.state, event, config);
  const again = turnsToRunAgain(arrived.state, event, config);

  return {
    state: again.state,
    effects: [
      ...begun.effects,
      ...arrived.effects,
      // The question that never went is nobody's arrival and no turn to run again.
      ...questionNeverPut(event, config),
      ...again.effects,
    ],
  };
}

/** The walk stands again on the row and question it already has; the repeat opens neither. */
function pickedUp(state: WalkState, event: WalkFact<"repeated">): WalkNext {
  return {
    state: {
      ...state,
      walks: {
        // Waits left by walks that are over hold their pills only until a new walk begins.
        ...withoutOverWaits(state),
        [event.runKey]: begunWalk(event.questionId, event.askedAt, event.runId),
      },
    },
    effects: [
      {
        kind: "takeWalk",
        runKey: event.runKey,
        askedAt: event.askedAt,
        runId: event.runId,
        questionId: event.questionId,
      },
    ],
  };
}

/**
 * Work that reached a point and was never taken up goes in first, so a point waiting on two suppliers already holds
 * one; a neighbour the repeat cannot reach is said, not skipped.
 */
function workThatArrived(state: WalkState, event: WalkFact<"repeated">, config: ProjectConfig): WalkNext {
  let standing = state;
  const effects: WalkEffect[] = [];

  for (const arrival of event.left.arrivals) {
    const to = config.agents.find((agent) => agent.id === arrival.toAgentId) ?? null;

    if (to === null) {
      continue;
    }

    const stopReason = cannotTake(to);
    const awaited = awaitedSuppliers(config, event.startAgentId, to.id);

    if (stopReason !== null) {
      effects.push({
        kind: "sayHandoff",
        runKey: event.runKey,
        fromAgentId: arrival.fromAgentId,
        toAgentId: to.id,
        stopReason,
        questionId: event.questionId,
        askedAt: event.askedAt,
      });

      const next = notTaken(
        standing,
        {
          fromId: arrival.fromAgentId,
          to,
          awaited,
          startAgentId: event.startAgentId,
          runKey: event.runKey,
        },
        config,
      );

      standing = next.state;
      effects.push(...next.effects);

      continue;
    }

    const work: IncomingWork = {
      text: arrival.text,
      cost: null,
      fromAgentId: arrival.fromAgentId,
      fromStepIds: [arrival.fromStepId],
      seconds: null,
      attached: [],
    };
    const via = lineTo(config, arrival.fromAgentId, to.id);

    if (awaited.length < 2) {
      effects.push({
        kind: "askAgent",
        agent: to,
        incoming: [work],
        startAgentId: event.startAgentId,
        viaLinkIds: via === null ? [] : [via],
        runKey: event.runKey,
        isAgain: false,
      });

      continue;
    }

    const next = settled(standing, {
      kind: "settled",
      to,
      awaited,
      fromId: arrival.fromAgentId,
      work,
      startAgentId: event.startAgentId,
      via,
      runKey: event.runKey,
    });

    standing = next.state;
    effects.push(...next.effects);
  }

  return {
    state: standing,
    effects,
  };
}

/**
 * A question that never went left no step, so the repeat puts the question itself; the only case with nothing in the
 * record.
 */
function questionNeverPut(event: WalkFact<"repeated">, config: ProjectConfig): WalkEffect[] {
  const aimed =
    event.notSentTo === null || event.left.again.length > 0 || event.left.arrivals.length > 0
      ? null
      : (config.agents.find((agent) => agent.id === event.notSentTo) ?? null);

  if (aimed === null) {
    return [];
  }

  return [
    {
      kind: "askAgent",
      agent: aimed,
      incoming: [
        {
          text: event.asked,
          cost: null,
          fromAgentId: null,
          fromStepIds: [],
          seconds: null,
          attached: [],
        },
      ],
      startAgentId: aimed.id,
      viaLinkIds: [],
      runKey: event.runKey,
      isAgain: true,
    },
  ];
}

/**
 * Every turn that did not answer runs again word for word. An unreachable agent is said by whoever fed it; a person's
 * turn has no feeder, so the row is about the question itself.
 */
function turnsToRunAgain(state: WalkState, event: WalkFact<"repeated">, config: ProjectConfig): WalkNext {
  let standing = state;
  const effects: WalkEffect[] = [];

  for (const turn of event.left.again) {
    const agent = config.agents.find((one) => one.id === turn.agentId) ?? null;

    if (agent === null) {
      continue;
    }

    const fed = event.walk.filter((step) => turn.fromStepIds.includes(step.id));
    const stopReason = cannotTake(agent);

    if (stopReason !== null) {
      for (const fromAgentId of fed.length === 0 ? [null] : fed.map((step) => step.agentId)) {
        effects.push({
          kind: "sayHandoff",
          runKey: event.runKey,
          fromAgentId,
          toAgentId: agent.id,
          stopReason,
          questionId: event.questionId,
          askedAt: event.askedAt,
        });
      }

      // Whoever waited on this agent waits no longer.
      const next = released(
        standing,
        {
          kind: "released",
          fromId: agent.id,
          startAgentId: event.startAgentId,
          runKey: event.runKey,
        },
        config,
      );

      standing = next.state;
      effects.push(...next.effects);

      continue;
    }

    effects.push({
      kind: "askAgent",
      agent,
      incoming: [
        {
          text: turn.asked,
          cost: null,
          fromAgentId: null,
          fromStepIds: turn.fromStepIds,
          seconds: null,
          attached: [],
        },
      ],
      startAgentId: event.startAgentId,
      viaLinkIds: fed.map((step) => lineTo(config, step.agentId, agent.id)).filter((id): id is string => id !== null),
      runKey: event.runKey,
      isAgain: true,
    });
  }

  return {
    state: standing,
    effects,
  };
}

/** The line one agent's work came by, so a picked-up walk lights the canvas like a live one. */
function lineTo(config: ProjectConfig, fromAgentId: string | null, toAgentId: string): string | null {
  return config.links.find((link) => link.from === fromAgentId && link.to === toAgentId)?.id ?? null;
}
