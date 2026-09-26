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

/**
 * A fact's own kind is the name of the rule that answers it. Every kind stands here and no kind stands
 * twice, so a fact nobody answers does not compile — the same table the effects already answer by.
 */
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
 * The walk itself: told what happened and what the drawn lines are, it says what the walk became and what it
 * asks of the world. It touches no provider, no record and no React, so every rule is provable without them.
 */
export function walkMachine(state: WalkState, event: WalkEvent, config: ProjectConfig): WalkNext {
  return (<WalkRule<WalkEvent["kind"]>>WALK_RULES[event.kind])(state, event, config);
}

/**
 * The stream was emptied. Every walk still out is put away: it runs to its end, writes its record, and its
 * words go with it. What was typed here goes with the stream that held it.
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
 * A walk that broke or was stopped, or with none named every walk of this stream. The end is marked before a
 * single turn is stopped, so nothing begins after it. A walk put away is not among them.
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
 * Every walk of the stream on screen — the ones the button under the field speaks for. A walk writing into
 * another row is another conversation and is not cut from here.
 */
function everyWalk(state: WalkState): string[] {
  return Object.keys(state.walks).filter((runKey) => isOnScreen(state, runKey));
}

/**
 * The question of this walk opened a row, and the walk writes into it from here on. A walk that already
 * knows its row keeps it: a row is opened once, by the question that began the conversation.
 */
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
 * A point left waiting by a walk that is over holds its pill only until a new walk begins. The walk itself
 * is not let go of — its words are the stream on screen — it is the waits that go.
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

/** One walk with one of its parts changed — the walk it is found by its own id. */
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
 * One supplier of a converging point has had its turn. While another is to come the point only holds what
 * arrived; when the last has been, it forgets the wait and works, or with empty hands lets down whoever waits.
 */
function settled(state: WalkState, event: WalkFact<"settled">): WalkNext {
  // The wait is this walk's own — found by the walk first, and only then by the point standing in it.
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
  };
  const stood = settledWait(standing, {
    fromId: event.fromId,
    work: event.work,
    via: event.via,
    isBroken: walk.isStopped,
  });

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

  // Nothing arrived at all: there is no work to do here, and none behind this agent either.
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
 * An agent that will not answer in this run lets down whoever waited on it, and the release walks on down
 * the lines: a point with one supplier simply passes it along, a converging point settles that supplier with nothing.
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

      // Nobody was waiting on this line, so there is nothing here to release.
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
 * A line that could not be taken: nothing ever goes down it. A converging point at its end is settled with
 * nothing, so it does not wait for what will never come; an agent standing alone lets down whoever waits behind.
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
 * The answer takes its lines out. Every link says its own row, taken or not, and hands the work on: to an agent
 * standing alone at once, to a converging point as one supplier of its wait, and down an untaken link never.
 */
function handedOn(state: WalkState, event: WalkFact<"handedOn">, config: ProjectConfig): WalkNext {
  const effects: WalkEffect[] = [];
  const walk = state.walks[event.runKey];
  let standing = state;

  // A walk the machine does not hold hands nothing on — the id found nothing, and standing still says so.
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

    // One live supplier is not a converging point: the work goes in the moment it arrives.
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
 * The person put a question. The walk begins with the question written down, even where it reaches nobody, and
 * a point left waiting by the walk that is over is let down: its wait held only until a new walk began.
 */
function put(state: WalkState, event: WalkFact<"put">): WalkNext {
  // A conversation walks one walk at a time — while a turn of this stream is out, the hand under the field
  // is «ЗУПИНИТИ» and nothing is sent. Another conversation is «+ НОВИЙ ЧАТ», and it walks beside this one.
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
        // The attached files ride with the person's own words into the turn; the stream shows neither.
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
        // The row this walk writes into is the conversation's, older than the walk whenever one was asked.
        runId: state.flowRunId,
        // The row is named by the agent it began with, as that agent stands now.
        agent: event.agent,
        asked: event.text,
      },
      ...asking.effects,
    ],
  };
}

/**
 * Work was put to an agent. A stopped walk begins nothing, and a switched-off agent takes nothing — said as the
 * question that stayed, never in silence. Whatever else the agent is doing is no wall.
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
   * Only the person's question reaches a switched-off agent; work down a line stops at the link. The words stand
   * in the stream all the same, with the row saying why they stayed, and the walk is over before it began.
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

/** The words a turn was given, said in the stream — the person's own, or what arrived down each line. */
function wordsGiven(event: WalkFact<"asked">, walk: Walk): WalkEffect {
  return {
    kind: "sayAsked",
    runKey: event.runKey,
    agentId: event.agent.id,
    incoming: event.incoming,
    // Every word of this walk stands in the block of the question that began it — the walk names it.
    questionId: walk.questionId,
    askedAt: walk.askedAt,
    isAgain: event.isAgain,
  };
}

/** The turn itself, put to the provider with the words it is to work on. */
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
    // A person's words go in as they were typed, and work that came by a line goes in as it was said.
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
 * The turn is back: the agent is free and the words stop arriving. Only an answer walks on — a fall, a cut turn
 * and one that never began each end the walk, and a question that never went is given back to its field.
 */
function answered(state: WalkState, event: WalkFact<"answered">, config: ProjectConfig): WalkNext {
  const ledger = state.ledgers[event.runKey] ?? null;
  // Every word of this walk stands in the block of the question that began it — the walk names it.
  const walk = state.walks[event.runKey];
  const said = tidyAnswer(event.answer.text);
  // The walk goes on through the agent's own words alone; a fall, a cut turn or one that never began
  // takes no line out.
  const goesOn = !event.answer.isFailure && !event.answer.isCut && event.answer.notStarted === null && said !== "";
  // A question that never went is not given back to the field — it stands in the stream and in the record
  // the moment it is asked, and the field is the person's to write the next one in.
  let standing: WalkState = {
    ...state,
    // The turn that came back is forgotten by its own id; another turn of this agent is not this one.
    out: forgotten(state.out, event.turnId),
  };

  // A turn of a walk the machine does not hold is forgotten and nothing more: the id found nothing.
  if (walk === undefined) {
    return {
      state: standing,
      effects: [],
    };
  }

  // The lines out of this turn, worked out once from the lines drawn out of the agent.
  const out = goesOn ? linkOuts(config, event.agent) : [];
  const effects: WalkEffect[] = [answerCard(event, walk, ledger, said)];
  // A turn that fell said nothing of its own, and what came back instead was the provider's sentence: the
  // record keeps it, so a run opened tomorrow says why it fell and not merely that it did.
  const written = said === "" ? (event.answer.fell ?? "") : said;

  // A turn that never began is a step too, so a walk broken that way survives closing.
  if (ledger !== null) {
    effects.push(writtenStep(event, config, written, out));
  }

  const next = goesOn ? handedOn(standing, handOut(event, said, out), config) : brokeOff(standing, event, config);

  standing = next.state;
  effects.push(...next.effects);

  // Everything this turn set going is going now: if nothing else is out, the walk is over.
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
      // Every word of this walk stands in the block of the question that began it — the walk names it.
      questionId: walk.questionId,
      askedAt: walk.askedAt,
      startedAt: event.startedAt,
      endedAt: event.endedAt,
      answer: event.answer,
    },
  };
}

/** The same turn as the record takes it: what it ran with, kept as it stood then, and where it handed on. */
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

/** The answer as the lines out of it hear it — the words, what they cost, and how long they took. */
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
 * A turn that answered nothing is the end of its walk — the walk is marked before anything else, so no
 * turn of it begins after, and whoever waited on this agent is let down.
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
 * «СПИТАТИ ЩЕ РАЗ» was pressed under one turn. The act is used up the moment it is pressed, and the record is
 * asked for the walk to pick up. Without a row of its own the stream has nothing to read.
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
        // The walk names the question, and never the hour — two questions of one breath differ by
        // milliseconds, and a repeat put under somebody else's words is worse than no repeat at all.
        walkId: event.said.walkId,
        notSentTo: event.said.from === "notSent" ? event.said.otherAgentId : null,
      },
    ],
  };
}
/**
 * A question's walk picked up where it broke: the walk begins again, what arrived and was never taken up goes
 * in, the question that never went is put, and every turn that did not answer runs again word for word.
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
      // The question that never went stands between the two: it is nobody's arrival and no turn to run again.
      ...questionNeverPut(event, config),
      ...again.effects,
    ],
  };
}

/** The walk stands again on the row and the question it already has; the repeat opens neither. */
function pickedUp(state: WalkState, event: WalkFact<"repeated">): WalkNext {
  return {
    state: {
      ...state,
      walks: {
        // A point left waiting by a walk that is over holds its pill only until a new walk begins.
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
 * Work that reached a point and was never taken up goes in first, so a point waiting on two suppliers
 * already holds one. A neighbour the repeat cannot reach is said, not skipped.
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
 * A question that never went left no step to run again, so the repeat puts that question itself. It is the
 * one case with nothing at all in the record: anything that did arrive or did run is the walk's own story.
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
 * Every turn that did not answer runs again word for word. An agent the repeat cannot reach is said by
 * whoever fed it — a turn the person asked has no feeder, so the row is about the question itself.
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

/** The line one agent's work came by, so a walk picked up lights the canvas as a live one does. */
function lineTo(config: ProjectConfig, fromAgentId: string | null, toAgentId: string): string | null {
  return config.links.find((link) => link.from === fromAgentId && link.to === toAgentId)?.id ?? null;
}
