import { useCallback, useEffect, useRef, useState } from "react";
import { forgetLive, sayPiece } from "../use-live-answer";
import { useNewsSeen } from "../use-news-seen";
import { useFlowRecord } from "../use-flow-record";
import { useOpenCalls } from "../use-open-calls";
import { answerTurn, stopTurn } from "../../api";
import { AGENT_CHUNK_CHANNEL } from "../../../../../../contracts";
import {
  agentStands,
  agentThread,
  answeredCard,
  askedCards,
  chatStream,
  emptyWalk,
  fellAgents,
  handoffCard,
  isOnScreen,
  isWalking,
  linkLives,
  wordsAwaitingHand,
  repeatOf,
  waitingAgents,
  walkMachine,
  workingTurns,
} from "../../logic";
import { readRun } from "../../../record";
import type { Agent, McpLook, OpenProject, ProviderState } from "../../../../interfaces";
import type {
  ChatMessage,
  RunLedger,
  WalkAct,
  WalkEffect,
  WalkEvent,
  PutTurn,
  WalkHands,
  WalkState,
} from "../../interfaces";
import type { AgentChatState } from "./interfaces";

/** Each agent's chat, in memory while the project is open; an answer walks the lines on until one runs out. */
export function useAgentChat(
  project: OpenProject,
  selectedAgentId: string | null,
  providers: ProviderState[],
  heard: (providerId: string, isAnswering: boolean) => void,
  /** What every declared server said it hands over, by server id; a turn reads it at the moment it asks. */
  looks: Record<string, McpLook>,
): AgentChatState {
  /** The stream that has no record of its own yet — «+ НОВИЙ ЧАТ» starts another, with an empty field. */
  const [freshStream, setFreshStream] = useState(() => crypto.randomUUID());
  /** Everything this stream's walks stand on, in one thing. */
  const [walked, setWalked] = useState<WalkState>(emptyWalk);
  // Ref mirrors state: a turn starting inside another turn's answer must read the current walk, not the drawn one.
  const stands = useRef(walked);
  const held = useRef(project);
  const machine = useRef(providers);
  const said = useRef(looks);
  /**
   * How tall the field under the stream stands. It is the person's own setting, kept where the canvas keeps its
   * scale — this machine's note about this project — so it outlives the window like everything else there.
   */
  const [fieldHeight, setFieldHeight] = useState<number | null>(project.view?.fieldHeight ?? null);
  /** Nothing opens itself, and what a hand opened stays open — the whole of that is remembered here. */
  const openCalls = useOpenCalls();
  /** Whom the chat is aimed at. Picking a sphere aims it; letting the sphere go leaves the aim standing. */
  const [aimedAgentId, setAimedAgentId] = useState<string | null>(project.view?.aimedAgentId ?? null);
  const aimed = useRef(aimedAgentId);
  /** The machine's own hand, held apart — the record is built before it and tells it of a row through this. */
  const told = useRef<(event: WalkEvent) => void>(() => undefined);
  /**
   * The record this conversation writes into, and the hand that writes there. The row moves at the person's
   * word only — a run opened, «+ НОВИЙ ЧАТ» — and never because a walk wrote a step.
   */
  const record = useFlowRecord(
    useCallback((runKey: string, runId: string) => {
      told.current({
        kind: "rowOpened",
        runKey,
        runId,
      });
    }, []),
    useCallback((runKey: string) => stands.current.walks[runKey]?.isPutAway === true, []),
  );
  const { writer } = record;
  /** Which stream is on screen — the run opened in its place, or the fresh one that has no record yet. */
  const stream = useRef(record.runId ?? freshStream);

  aimed.current = aimedAgentId;
  held.current = project;
  machine.current = providers;
  said.current = looks;
  stream.current = record.runId ?? freshStream;

  useEffect(() => {
    if (selectedAgentId !== null) {
      setAimedAgentId(selectedAgentId);
    }
  }, [selectedAgentId]);

  /** The walk moves as a whole, and the ref moves with it — the next callback must not see the old one. */
  const change = useCallback((moved: (standing: WalkState) => WalkState) => {
    stands.current = moved(stands.current);
    setWalked(stands.current);
  }, []);
  /**
   * A word is written into the walk that said it, by the walk's own id. Every walk keeps saying,
   * put away or not — the screen decides what to draw, and a stream emptied takes nothing from another one.
   */
  const sayIn = useCallback(
    (runKey: string, moved: (was: ChatMessage[]) => ChatMessage[]) => {
      change((standing) => {
        const walk = standing.walks[runKey];

        if (walk === undefined) {
          return standing;
        }

        return {
          ...standing,
          walks: {
            ...standing.walks,
            [runKey]: {
              ...walk,
              said: moved(walk.said),
            },
          },
        };
      });
    },
    [change],
  );
  /**
   * The walk as a callback sees it. The ledgers are the writer's own book, so they are asked of the writer
   * and never kept twice; the aim and the row belong to the screen and are read where the screen holds them.
   */
  const walkNow = useCallback(
    (): WalkState => ({
      ...stands.current,
      ledgers: writer.walks(),
      aimedAgentId: aimed.current,
      flowRunId: record.standing(),
    }),
    [],
  );
  /** The hands the runner reaches for, held apart so the one runner below never takes an old one. */
  const hands = useRef<WalkHands>({
    askAgent: () => undefined,
    askMachine: () => undefined,
    stopMachine: () => undefined,
    letDown: () => undefined,
    sayHandoff: () => undefined,
    sayAsked: () => undefined,
    sayAnswer: () => undefined,
    writeTurn: () => undefined,
    turnBack: () => undefined,
    openWalk: () => undefined,
    takeWalk: () => undefined,
    askAgain: () => undefined,
  });
  /**
   * What the machine asked the world to do, done. An effect's own kind is the name of the hand that
   * answers it, so there is one line here and no list to keep level with the effects.
   */
  const carryOut = useCallback((effects: WalkEffect[]) => {
    for (const effect of effects) {
      (<(act: WalkEffect) => void>hands.current[effect.kind])(effect);
    }
  }, []);

  /**
   * One fact told to the walk. Everything the walk became goes back where React holds it, and then what it
   * asked of the world is done — so no rule has to remember which of the pieces its own answer touched.
   */
  const dispatch = useCallback(
    (event: WalkEvent) => {
      const { state, effects } = walkMachine(walkNow(), event, held.current.config);

      change(() => state);
      carryOut(effects);
    },
    [carryOut, change, walkNow],
  );

  told.current = dispatch;

  // The one reverse channel, subscribed once for the section; each piece names its turn, and only that turn's card
  // hears it — a token is no news to the spheres, the lines or the history.
  useEffect(
    () => window.electronApi.subscribe(AGENT_CHUNK_CHANNEL, (piece) => sayPiece(piece.turnId, piece.text, piece.call)),
    [],
  );

  const changeDraft = useCallback(
    (written: string) => {
      change((standing) => ({
        ...standing,
        drafts: {
          ...standing.drafts,
          [stream.current]: written,
        },
      }));
    },
    [change],
  );

  /**
   * One row about one link — «ПЕРЕДАЄ» where the work went, «НЕ ПЕРЕДАЄ · ВИМКНЕНИЙ» where it
   * did not. With no sender it is the person's own question, and the row says so instead.
   */
  const sayHandoff = useCallback(
    ({ runKey, fromAgentId, toAgentId, stopReason, questionId, askedAt }: WalkAct<"sayHandoff">) => {
      sayIn(runKey, (standing) => [
        ...standing,
        handoffCard({
          id: crypto.randomUUID(),
          runKey,
          fromAgentId,
          toAgentId,
          stopReason,
          questionId,
          askedAt,
          at: Date.now(),
        }),
      ]);
    },
    [sayIn],
  );

  /** The words a turn was given — the person's own, or what arrived down each line. */
  const sayAsked = useCallback(
    ({ runKey, agentId, incoming, questionId, askedAt, isAgain }: WalkAct<"sayAsked">) => {
      sayIn(runKey, (standing) => [
        ...standing,
        ...askedCards({
          ids: incoming.map(() => crypto.randomUUID()),
          runKey,
          agentId,
          incoming,
          questionId,
          askedAt,
          at: Date.now(),
          isAgain,
        }),
      ]);
    },
    [sayIn],
  );

  /** A walk begins — the writer takes it, and its question is written the moment it is asked. */
  const openWalk = useCallback(
    ({ runKey, questionId, askedAt, runId, agent, asked }: WalkAct<"openWalk">) => {
      const ledger: RunLedger = {
        walkId: runKey,
        askedAt,
        runId,
        questionId,
        out: 0,
        stepIdOf: {},
        queue: Promise.resolve(),
      };

      writer.hold(runKey, ledger);
      // The question is written the moment it is asked, so a flow that reaches nobody still stands in the
      // record; two questions asked in one breath share one row.
      writer.askQuestion(ledger, held.current.directory, agent, asked, runKey);
    },
    [writer],
  );

  /** A walk picked up out of the record — the writer takes it, and no question is written: it has one. */
  const takeWalk = useCallback(
    ({ runKey, askedAt, runId, questionId }: WalkAct<"takeWalk">) => {
      writer.hold(runKey, {
        walkId: runKey,
        askedAt,
        runId,
        questionId,
        out: 0,
        stepIdOf: {},
        queue: Promise.resolve(),
      });
      // The row this repeat writes into is the one the person pressed it on, and the screen is already
      // standing there. Should they have left for another row while the record was read, they stay where they went.
      record.learnRow(runKey, runId);
    },
    [record, writer],
  );

  /** The card one turn became, put in the stream of the walk it ran in. */
  const sayAnswer = useCallback(
    ({ runKey, turn }: WalkAct<"sayAnswer">) => {
      sayIn(runKey, (standing) => [...standing, answeredCard(turn)]);
    },
    [sayIn],
  );

  /** One finished turn written down as a step; the card then takes the id of the step it became. */
  const writeTurn = useCallback(
    ({ runKey, saidId, turn }: WalkAct<"writeTurn">) => {
      const ledger = writer.walks()[runKey] ?? null;

      if (ledger === null) {
        return;
      }

      writer.writeTurn(ledger, runKey, turn, (stepId: string) =>
        sayIn(runKey, (standing) =>
          standing.map((said) =>
            said.id === saidId
              ? {
                  ...said,
                  stepId,
                }
              : said,
          ),
        ),
      );
    },
    [sayIn, writer],
  );

  /**
   * One turn of a walk is back. The run ends when the last of them does, at the moment the walk ended — the
   * writes may still be going, and they go on into the row it opened.
   */
  const turnBack = useCallback(
    ({ runKey }: WalkAct<"turnBack">) => {
      const ledger = writer.walks()[runKey] ?? null;

      if (ledger === null) {
        return;
      }

      // A walk whose question never went put no turn out at all, and is over the moment it is said.
      ledger.out = Math.max(0, ledger.out - 1);

      if (ledger.out > 0) {
        return;
      }

      const endedAt = Date.now();

      // The writer holds this walk no longer, and the walk itself stays where it is — its words
      // are the stream on screen until «+ НОВИЙ ЧАТ» empties it.
      writer.drop(runKey);
      writer.closeWalk(ledger, runKey, endedAt);
    },
    [dispatch, writer],
  );

  /**
   * What this agent has answered in this conversation, read out of the row the conversation writes into.
   * The record is the one place it lives, so the writes of every walk are let settle first — a pair written a
   * moment ago must be in it. A conversation with no row yet has nothing behind it, and neither has an agent
   * asked here for the first time.
   */
  const threadOf = useCallback(
    async (runId: string | null, agentId: string) => {
      if (runId === null) {
        return [];
      }

      await writer.settled();

      const run = await readRun(runId);

      return run === null ? [] : agentThread(run.walk, agentId);
    },
    [writer],
  );

  /** The turn the machine named goes out — the run counts it, and the provider is asked. */
  const askMachine = useCallback(
    ({ agent, turnId, incoming, startAgentId, runKey, startedAt, asked }: PutTurn) => {
      const ledger = writer.walks()[runKey] ?? null;

      // One more turn of this run is out; the run ends when the last of them comes back.
      if (ledger !== null) {
        ledger.out += 1;
      }

      const config = held.current.config;
      const stands = agentStands(agent, config, machine.current);
      const { model } = stands;
      // A walk put away goes on writing into the row it began in; the stream's own row is every other walk's.
      const row = ledger?.runId ?? record.standing();

      void threadOf(row, agent.id)
        .then((thread) =>
          answerTurn({
            turnId,
            agent,
            stands,
            asked,
            thread,
            catalogue: {
              commands: config.commands,
              servers: config.servers,
              // What a server hands over is live: it is read now, and never from what the turn was set up with.
              looks: said.current,
            },
            directory: held.current.directory,
          }),
        )
        .then((answered) => {
          // The turn came back, so nothing arrives for it any more — its words are a card of their own now.
          forgetLive(turnId);

          // A turn that reached the address, or was refused by the silence there, says so — the dot follows
          // the turn instead of waiting for the provider card's own asking. Every other refusal never got that far.
          if (model !== null && (answered.notStarted === null || answered.notStarted === "silent")) {
            heard(model.provider, answered.notStarted === null);
          }

          dispatch({
            kind: "answered",
            agent,
            turnId,
            runKey,
            incoming,
            startAgentId,
            asked,
            answer: answered,
            saidId: crypto.randomUUID(),
            startedAt,
            endedAt: Date.now(),
          });
        });
    },
    [dispatch, record, threadOf, writer],
  );

  /** Work put to an agent — the machine says whether the turn goes out or the row says why not. */
  const askAgent = useCallback(
    ({ agent, incoming, startAgentId, viaLinkIds, runKey, isAgain }: WalkAct<"askAgent">) => {
      dispatch({
        kind: "asked",
        agent,
        incoming,
        startAgentId,
        viaLinkIds,
        runKey,
        isAgain,
        turnId: crypto.randomUUID(),
        startedAt: Date.now(),
      });
    },
    [dispatch],
  );

  /** An agent that will not answer lets down whoever waits for it; the machine walks the lines. */
  const letDown = useCallback(
    ({ fromId, startAgentId, runKey }: WalkAct<"letDown">) => {
      dispatch({
        kind: "released",
        fromId,
        startAgentId,
        runKey,
      });
    },
    [dispatch],
  );

  hands.current = {
    askAgent,
    stopMachine: ({ turnId }) => {
      void stopTurn(turnId);
    },
    letDown,
    sayHandoff,
    sayAsked,
    askMachine,
    sayAnswer,
    writeTurn,
    turnBack,
    openWalk,
    takeWalk,
    askAgain: (act) => {
      void askAgain(act);
    },
  };

  /**
   * Reads the run back and picks the broken walk up where it stopped: every turn of the broken step runs again
   * word for word, and work that arrived and was never taken up is handed back to the point waiting for it.
   */
  const askAgain = useCallback(
    async ({ runId, questionId, walkId, notSentTo }: WalkAct<"askAgain">) => {
      // The walk is read out of the record, so the record has to hold what broke a moment ago.
      await writer.settled(walkId ?? "");

      const run = await readRun(runId);
      const repeat = run === null ? null : repeatOf(run, questionId, notSentTo, crypto.randomUUID());

      if (repeat !== null) {
        dispatch(repeat);
      }
    },
    [dispatch, writer],
  );

  /**
   * One walk of the line, from this question to the last step it reaches. The
   * record it writes into is the conversation's, which is older than this walk whenever one was asked.
   */
  const put = useCallback(
    (agent: Agent, text: string, fedFrom: string[] = [], isAgain = false) => {
      dispatch({
        kind: "put",
        agent,
        text,
        fedFrom,
        isAgain,
        // The question's own id, minted here and kept by the record — one id from the first moment.
        questionId: crypto.randomUUID(),
        runKey: crypto.randomUUID(),
        askedAt: Date.now(),
        turnId: crypto.randomUUID(),
      });
    },
    [dispatch],
  );

  const send = useCallback(() => {
    const agentId = aimedAgentId;

    if (agentId === null) {
      return;
    }

    const text = (stands.current.drafts[stream.current] ?? "").trim();
    const agent = held.current.config.agents.find((standing) => standing.id === agentId) ?? null;

    // An agent switched off is asked all the same — the walk says why the question stayed, and never
    // drops it in silence.
    if (text === "" || agent === null) {
      return;
    }

    // This conversation is walking, so there is nothing to send with — and what is typed stays where it
    // was typed, waiting for the walk to end or for «ЗУПИНИТИ».
    if (isWalking(walkNow())) {
      return;
    }

    change((standing) => ({
      ...standing,
      drafts: {
        ...standing.drafts,
        [stream.current]: "",
      },
    }));
    put(agent, text);
  }, [aimedAgentId, change, put, walkNow]);

  /** «СПИТАТИ ЩЕ РАЗ» — the same agent, the same question, inside the record it already has. */
  const sayAgain = useCallback(
    (said: ChatMessage) => {
      dispatch({
        kind: "sayAgain",
        said,
      });
    },
    [dispatch],
  );

  /** A fresh stream; a walk still out runs on into its record and keeps its live row. */
  const fresh = useCallback(() => {
    dispatch({
      kind: "putAway",
      stream: freshStream,
    });
    // The record goes on for as long as the conversation does, and this is where it ends.
    record.turnTo(null);
    setFreshStream(crypto.randomUUID());
  }, [dispatch, freshStream, record]);

  /**
   * Every turn of the walk on screen is ended in the main process, and a stopped turn hands nothing on. A
   * walk put away carries on: it was let go, not stopped.
   */
  const stop = useCallback(() => {
    dispatch({
      kind: "stopped",
      runKey: null,
    });
  }, [dispatch]);
  /** What this stream's walks stand on, as the drawn render sees them. */
  const walk: WalkState = {
    ...walked,
    ledgers: writer.walks(),
    aimedAgentId,
    flowRunId: record.runId,
  };
  /**
   * The turn of the aimed agent the chat stands on. Only this conversation's — another one walks
   * beside it and says nothing here — and there is at most one of it, since a conversation walks one walk at a time.
   */
  const turn = Object.values(walk.out)
    .filter((standing) => standing.agentId === aimedAgentId && isOnScreen(walk, standing.runKey))
    .sort((one, other) => one.startedAt - other.startedAt)
    .at(0);

  const waiting = wordsAwaitingHand(walk);
  /** What of this has been shown already — the dot over «ІСТОРІЯ» asks this and nothing else does. */
  const news = useNewsSeen(waiting.elsewhere, waiting.onScreen);

  return {
    /** An agent whose last turn fell and has said nothing since; one good turn clears it. */
    fellAt: fellAgents(walk),
    /**
     * Whether a conversation not on screen holds a turn that waits for the hand. News of this session
     * alone: what stands in the record from before is the history's own row to carry, not a sign over it.
     */
    isNewsElsewhere: news.isNewsElsewhere,
    /** The history was opened — from here on this is no news, whether or not the cause was mended. */
    readNews: news.readNews,
    /** The aim, and never a sphere gone from the project — a deleted agent leaves it aimed at nobody. */
    aimedAgentId: project.config.agents.some((agent) => agent.id === aimedAgentId) ? aimedAgentId : null,
    /** Aiming without touching the canvas — opening a run points the chat at whoever walked it. */
    aim: setAimedAgentId,
    openCalls,
    fieldHeight,
    setFieldHeight,
    /** A fresh stream; a walk still out runs on into its record and keeps its live row. */
    fresh,
    sayAgain,
    saidAgain: walked.saidAgain,
    /** The run this stream writes into, so the projection can be opened on it. */
    runId: record.runId,
    /**
     * A run opened from the history stands in the stream's place, and a question asked there goes on in that
     * run — «і йде далі цією ж розмовою».
     */
    goOnIn: (runId: string) => {
      record.turnTo(runId);
    },
    /**
     * A record deleted by hand takes its conversation with it — the stream on screen
     * is emptied when it was writing into that record, and left alone when it was not.
     */
    letGo: (runId: string) => {
      if (record.standing() === runId) {
        fresh();
      }
    },
    messages: chatStream(walk),
    draft: walked.drafts[stream.current] ?? "",
    isWorking: turn !== undefined,
    /** Bumped by every step written and by every run closed, so the history can follow. */
    written: record.written,
    startedAt: turn === undefined ? null : turn.startedAt,
    // Every turn out, not just the aimed agent's — the canvas draws them all, and the chat each in its own block.
    working: workingTurns(walk),
    waiting: waitingAgents(walk),
    /** How every line of the canvas stands right now — flowing, awaited, answered or silent. */
    linkLives: linkLives(project.config.links, walk),
    changeDraft,
    send,
    stop,
  };
}
