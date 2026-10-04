import { useCallback, useEffect, useRef, useState } from "react";
import { forgetLive, sayPiece } from "../use-live-answer";
import { useNewsSeen } from "../use-news-seen";
import { useFlowRecord } from "../use-flow-record";
import { useOpenCalls } from "../use-open-calls";
import { answerTurn, pickAttachment, stopTurn } from "../../api";
import { usePackedSend } from "../use-packed-send";
import { AGENT_CHUNK_CHANNEL } from "../../../../../../contracts";
import {
  agentRegistry,
  agentStands,
  agentThread,
  memoryLength,
  unreadTurn,
  answeredCard,
  askedCards,
  chatStream,
  emptyWalk,
  fellAgents,
  handoffCard,
  isOnScreen,
  isWalking,
  linkLives,
  packCeiling,
  wordsAwaitingHand,
  repeatOf,
  waitingAgents,
  walkBroke,
  walkMachine,
  workingTurns,
} from "../../logic";
import { refusedPickNote } from "../../words";
import { NO_MEMORY, REPEAT_LEAST } from "../../constants";
import { thrownWords } from "../../../../utils/errors";
import { RECORD_GONE_NOTE, closeRun, readRun, sharedMemory } from "../../../record";
import type {
  Agent,
  McpLook,
  OpenProject,
  PackedAttachment,
  PickedAttachment,
  ProviderState,
} from "../../../../interfaces";
import type {
  ChatMessage,
  RunLedger,
  WalkAct,
  WalkEffect,
  WalkEvent,
  PutTurn,
  TurnMemory,
  WalkHands,
  WalkState,
} from "../../interfaces";
import type { AgentChatState, RepeatCycle } from "./interfaces";

/** Each agent's chat, in memory while the project is open; an answer walks the lines on until one runs out. */
export function useAgentChat(
  project: OpenProject,
  selectedAgentId: string | null,
  providers: ProviderState[],
  heard: (providerId: string, isAnswering: boolean) => void,
  /** What each declared server hands over, by server id; read when a turn asks. */
  looks: Record<string, McpLook>,
  /** Reports a pick that was not attached, and why, on the line over the canvas. */
  onRefused: (words: string) => void,
): AgentChatState {
  /** The stream with no record yet; «+ НОВИЙ ЧАТ» starts another with an empty field. */
  const [freshStream, setFreshStream] = useState(() => crypto.randomUUID());
  /** Everything this stream's walks stand on, in one thing. */
  const [walked, setWalked] = useState<WalkState>(emptyWalk);
  // Mirrors state: a turn starting inside another turn's answer must read the current walk.
  const stands = useRef(walked);
  const held = useRef(project);
  const machine = useRef(providers);
  const said = useRef(looks);
  const refused = useRef(onRefused);
  /** Height of the field under the stream; a per-machine, per-project setting kept beside the canvas scale. */
  const [fieldHeight, setFieldHeight] = useState<number | null>(project.view?.fieldHeight ?? null);
  /** «x1»: how many times the next question goes in a row; kept after the repeats are done. */
  const [repeats, setRepeats] = useState(REPEAT_LEAST);
  /** The repeats under way; the field stays shut from the first send to the last walk's end. */
  const [cycle, setCycle] = useState<RepeatCycle | null>(null);
  const cycling = useRef(cycle);
  /** Remembers which calls a hand opened; nothing opens itself. */
  const openCalls = useOpenCalls();
  /** Whom the chat is aimed at; picking a sphere aims it, releasing the sphere keeps the aim. */
  const [aimedAgentId, setAimedAgentId] = useState<string | null>(project.view?.aimedAgentId ?? null);
  const aimed = useRef(aimedAgentId);
  /** The machine's own handler, held apart; the record is built before it and tells it of a row through this. */
  const told = useRef<(event: WalkEvent) => void>(() => undefined);
  /**
   * The record this conversation writes into, and its writer; the row changes only at the person's word (a run opened, «+
   * НОВИЙ ЧАТ»), never when a walk writes a step.
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
  /** The stream on screen: the opened run, or the fresh one with no record yet. */
  const stream = useRef(record.runId ?? freshStream);

  aimed.current = aimedAgentId;
  held.current = project;
  machine.current = providers;
  said.current = looks;
  refused.current = onRefused;
  stream.current = record.runId ?? freshStream;

  useEffect(() => {
    if (selectedAgentId !== null) {
      setAimedAgentId(selectedAgentId);
    }
  }, [selectedAgentId]);

  /** Moves the repeats and the ref with them, so an effect never puts the same repeat twice. */
  const turnCycle = useCallback((next: RepeatCycle | null) => {
    cycling.current = next;
    setCycle(next);
  }, []);

  /** Updates the walk as a whole and the ref with it, so the next callback sees the new one. */
  const change = useCallback((moved: (standing: WalkState) => WalkState) => {
    stands.current = moved(stands.current);
    setWalked(stands.current);
  }, []);
  /** Writes a word into the walk that said it, by walk id; every walk keeps saying, put away or not. */
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
  /** The walk as a callback sees it; ledgers are asked of the writer, the aim and the row are read from the screen. */
  const walkNow = useCallback(
    (): WalkState => ({
      ...stands.current,
      ledgers: writer.walks(),
      aimedAgentId: aimed.current,
      flowRunId: record.standing(),
    }),
    [],
  );
  /** The stream on screen when a pack comes back; the question goes or waits there. */
  const streamNow = useCallback(() => stream.current, []);
  /** A question with files: packed first, then sent or given back. */
  const packed = usePackedSend(streamNow);
  /** The hands the runner reaches for, held in a ref so the one runner never takes stale ones. */
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
    dropWalk: () => undefined,
    closeAgain: () => undefined,
  });
  /** Carries out the effects the machine asked for; an effect's kind names the hand that answers it. */
  const carryOut = useCallback((effects: WalkEffect[]) => {
    for (const effect of effects) {
      (<(act: WalkEffect) => void>hands.current[effect.kind])(effect);
    }
  }, []);

  /** Tells one fact to the walk, stores what it became where React holds it, then carries out its effects. */
  const dispatch = useCallback(
    (event: WalkEvent) => {
      const { state, effects } = walkMachine(walkNow(), event, held.current.config);

      change(() => state);
      carryOut(effects);
    },
    [carryOut, change, walkNow],
  );

  told.current = dispatch;

  // The one reverse channel, subscribed once per section; each piece names its turn and only that turn's card hears it.
  useEffect(
    () => window.electronApi.subscribe(AGENT_CHUNK_CHANNEL, (piece) => sayPiece(piece.turnId, piece.text, piece.call)),
    [],
  );

  const changeDraft = useCallback(
    (written: string) => {
      // The field is shut while repeats go.
      if (cycling.current !== null) {
        return;
      }

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
   * One row about one link: «ПЕРЕДАЄ» where the work went, «НЕ ПЕРЕДАЄ · ВИМКНЕНИЙ» where it did not; with no sender, the
   * person's own question.
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

  /** The words a turn was given: the person's own, or what arrived down each line. */
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

  /** Begins a walk: the writer takes it and its question is written when asked. */
  const openWalk = useCallback(
    ({ runKey, questionId, askedAt, runId, agent, asked, attached }: WalkAct<"openWalk">) => {
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
      // Written before the first turn goes, so a flow reaching nobody still stands in the record.
      void writer.askQuestion(ledger, held.current.directory, agent, asked, attached, runKey).then(
        () =>
          dispatch({
            kind: "questionWritten",
            runKey,
          }),
        (failure: unknown) =>
          dispatch({
            kind: "questionUnsaved",
            runKey,
            failure: thrownWords(failure),
          }),
      );
    },
    [dispatch, writer],
  );

  /** A walk picked up from the record: the writer takes it, no question is written. */
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
      // The repeat writes into the row the person pressed it on; if they moved to another row meanwhile, they stay
      // there.
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

  /** Writes one finished turn as a step; the card takes the step's id and the walk goes on from it. */
  const writeTurn = useCallback(
    ({ runKey, saidId, turn }: WalkAct<"writeTurn">) => {
      const ledger = writer.walks()[runKey] ?? null;

      if (ledger === null) {
        dispatch({
          kind: "stepUnsaved",
          runKey,
          saidId,
          failure: RECORD_GONE_NOTE,
        });

        return;
      }

      void writer.writeTurn(ledger, runKey, turn).then(
        (stepId) => {
          sayIn(runKey, (standing) =>
            standing.map((said) =>
              said.id === saidId
                ? {
                    ...said,
                    stepId,
                  }
                : said,
            ),
          );
          dispatch({
            kind: "stepWritten",
            runKey,
            saidId,
          });
        },
        (failure: unknown) =>
          dispatch({
            kind: "stepUnsaved",
            runKey,
            saidId,
            failure: thrownWords(failure),
          }),
      );
    },
    [dispatch, sayIn, writer],
  );

  /**
   * One turn of a walk is back; the run ends when the last one is, at the moment the walk ended, and the writes go on
   * into its row.
   */
  const turnBack = useCallback(
    ({ runKey }: WalkAct<"turnBack">) => {
      const ledger = writer.walks()[runKey] ?? null;

      if (ledger === null) {
        return;
      }

      // A walk whose question never went has no turn out and is over as soon as it is said.
      ledger.out = Math.max(0, ledger.out - 1);

      if (ledger.out > 0) {
        return;
      }

      const endedAt = Date.now();

      // The writer drops this walk; the walk stays as the on-screen stream until «+ НОВИЙ ЧАТ» empties it.
      writer.drop(runKey);
      void writer.closeWalk(ledger, runKey, endedAt).catch((failure: unknown) => {
        if (ledger.runId !== null) {
          dispatch({
            kind: "closeUnsaved",
            runKey,
            closing: {
              runId: ledger.runId,
              endedAt,
            },
            failure: thrownWords(failure),
          });
        }
      });
    },
    [dispatch, writer],
  );

  /** The writer lets a walk go without closing its row. */
  const dropWalk = useCallback(
    ({ runKey }: WalkAct<"dropWalk">) => {
      writer.drop(runKey);
    },
    [writer],
  );

  /** Stamps a walk's end again, after the record refused it. */
  const closeAgain = useCallback(
    ({ runKey, closing }: WalkAct<"closeAgain">) => {
      void closeRun(closing.runId, closing.endedAt).then(
        () =>
          dispatch({
            kind: "walkClosed",
            runKey,
          }),
        (failure: unknown) =>
          dispatch({
            kind: "closeUnsaved",
            runKey,
            closing,
            failure: thrownWords(failure),
          }),
      );
    },
    [dispatch],
  );

  /**
   * The memory this agent goes with, read from the record after every walk's writes settle: its own thread, or what has
   * happened to the question so far; nothing without a row or with the memory switched off. Rejects when the record
   * cannot be read.
   */
  const memoryOf = useCallback(
    async (runId: string | null, questionId: string, agent: Agent): Promise<TurnMemory> => {
      if (runId === null || agent.memory === "none") {
        return NO_MEMORY;
      }

      await writer.settled();

      if (agent.memory === "shared") {
        const shared = await sharedMemory(runId, questionId);

        if (shared === null) {
          throw new Error(RECORD_GONE_NOTE);
        }

        return {
          thread: [],
          shared,
        };
      }

      const run = await readRun(runId);

      if (run === null) {
        throw new Error(RECORD_GONE_NOTE);
      }

      return {
        thread: agentThread(run.walk, agent),
        shared: "",
      };
    },
    [writer],
  );

  /** Sends the turn the machine named: the run counts it and the provider is asked. */
  const askMachine = useCallback(
    ({ agent, turnId, questionId, incoming, startAgentId, runKey, startedAt, asked }: PutTurn) => {
      const ledger = writer.walks()[runKey] ?? null;

      // One more turn of this run is out; the run ends when the last comes back.
      if (ledger !== null) {
        ledger.out += 1;
      }

      const config = held.current.config;
      const stands = agentStands(agent, config, machine.current);
      const { model } = stands;
      // A put-away walk keeps writing into the row it began in; every other walk uses the stream's row.
      const row = ledger?.runId ?? record.standing();

      void memoryOf(row, questionId, agent)
        .then((memory) => {
          const catalogue = {
            commands: config.commands,
            servers: config.servers,
            // Read live, never from what the turn was set up with.
            looks: said.current,
            agents: config.agents,
          };

          return answerTurn({
            turnId,
            agent,
            stands,
            asked,
            memory,
            catalogue,
            agents: agentRegistry(agent, config, machine.current, catalogue),
            directory: held.current.directory,
            runId: row,
            questionId,
          }).then((answered) => ({
            answered,
            carried: memoryLength(memory),
            isAsked: true,
          }));
        })
        .catch((failure: unknown) => ({
          answered: unreadTurn(thrownWords(failure)),
          carried: 0,
          isAsked: false,
        }))
        .then(({ answered, carried, isAsked }) => {
          // The turn is back, so nothing arrives for it; its words are a card of their own.
          forgetLive(turnId);

          // A turn that reached the address, or was refused by silence there, updates the dot at once; other refusals
          // never got that far.
          if (isAsked && model !== null && (answered.notStarted === null || answered.notStarted === "silent")) {
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
            memoryLength: carried,
            answer: answered,
            saidId: crypto.randomUUID(),
            startedAt,
            endedAt: Date.now(),
          });
        });
    },
    [dispatch, memoryOf, record, writer],
  );

  /** Work put to an agent: the machine decides whether the turn goes out or the row says why not. */
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

  /**
   * Reads the run back and resumes the broken walk: every turn of the broken step reruns verbatim, and arrived but
   * untaken work goes to the waiting point.
   */
  const askAgain = useCallback(
    async ({ runId, questionId, walkId, notSentTo, saidId }: WalkAct<"askAgain">) => {
      // The record must hold what broke a moment ago.
      await writer.settled(walkId ?? "");

      try {
        const run = await readRun(runId);
        const repeat = run === null ? null : repeatOf(run, questionId, notSentTo, crypto.randomUUID());

        dispatch(
          repeat ?? {
            kind: "recordUnread",
            saidId,
            failure: RECORD_GONE_NOTE,
          },
        );
      } catch (failure) {
        dispatch({
          kind: "recordUnread",
          saidId,
          failure: thrownWords(failure),
        });
      }
    },
    [dispatch, writer],
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
    dropWalk,
    closeAgain,
  };

  /**
   * One walk from this question to the last step it reaches, written into the conversation's record (older than the
   * walk).
   */
  const put = useCallback(
    (agent: Agent, text: string, attached: PackedAttachment[]): string => {
      const runKey = crypto.randomUUID();

      dispatch({
        kind: "put",
        agent,
        text,
        attached,
        fedFrom: [],
        isAgain: false,
        // The question's id, minted here and kept by the record.
        questionId: crypto.randomUUID(),
        runKey,
        askedAt: Date.now(),
        turnId: crypto.randomUUID(),
      });

      return runKey;
    },
    [dispatch],
  );

  /** A question that did not go returns to its field with its attachments; newer typed words stay. */
  const giveBack = useCallback(
    (at: string, text: string, picked: PickedAttachment[]) => {
      change((standing) => ({
        ...standing,
        drafts: {
          ...standing.drafts,
          [at]: (standing.drafts[at] ?? "") === "" ? text : standing.drafts[at],
        },
        attachments: {
          ...standing.attachments,
          [at]: [...picked, ...(standing.attachments[at] ?? [])],
        },
      }));
    },
    [change],
  );

  const send = useCallback(() => {
    const agentId = aimedAgentId;

    if (agentId === null) {
      return;
    }

    const at = stream.current;
    const text = (stands.current.drafts[at] ?? "").trim();
    const agent = held.current.config.agents.find((standing) => standing.id === agentId) ?? null;

    // An agent switched off is still asked: the walk says why the question stayed.
    if (text === "" || agent === null) {
      return;
    }

    // The conversation is walking or still packing, so nothing is sent; typed text stays until the walk ends or
    // «ЗУПИНИТИ».
    if (isWalking(walkNow()) || packed.isPacking(at) || cycling.current !== null) {
      return;
    }

    const picked = stands.current.attachments[at] ?? [];
    /** The first of the repeats; none for a plain send. */
    const first = (runKey: string | null, attached: PackedAttachment[]): RepeatCycle | null =>
      repeats > REPEAT_LEAST
        ? {
            agentId,
            text,
            attached,
            runKey,
            sent: 1,
            total: repeats,
          }
        : null;

    // The question and its files leave the field together, which is left clear.
    change((standing) => ({
      ...standing,
      drafts: {
        ...standing.drafts,
        [at]: "",
      },
      attachments: {
        ...standing.attachments,
        [at]: [],
      },
    }));

    if (picked.length === 0) {
      turnCycle(first(put(agent, text, []), []));

      return;
    }

    // The field is shut while packing, too; the repeats begin with the packed files once the first goes.
    turnCycle(first(null, []));
    packed.send({
      stream: at,
      text,
      picked,
      ceiling: packCeiling(agentStands(agent, held.current.config, machine.current)),
      onPacked: (attached) => {
        const runKey = put(agent, text, attached);

        // Stopped while packing: the question goes alone.
        if (cycling.current !== null) {
          turnCycle({
            ...cycling.current,
            attached,
            runKey,
          });
        }
      },
      onGivenBack: () => {
        turnCycle(null);
        giveBack(at, text, picked);
      },
    });
  }, [aimedAgentId, change, giveBack, packed, put, repeats, turnCycle, walkNow]);

  // A whole walk puts the same question again until the count is reached; a broken, stopped or left walk ends the
  // repeats.
  useEffect(() => {
    const going = cycling.current;

    if (going === null || going.runKey === null) {
      return;
    }

    const now = walkNow();

    if (isOnScreen(now, going.runKey) && isWalking(now)) {
      return;
    }

    const agent = held.current.config.agents.find((one) => one.id === going.agentId) ?? null;

    if (
      agent === null ||
      going.sent >= going.total ||
      !isOnScreen(now, going.runKey) ||
      walkBroke(now.walks[going.runKey] ?? null)
    ) {
      turnCycle(null);

      return;
    }

    turnCycle({
      ...going,
      runKey: put(agent, going.text, going.attached),
      sent: going.sent + 1,
    });
  }, [cycle, put, turnCycle, walkNow, walked]);

  /** «+ ПРИКРІПИТИ»: opens the native pick; the choice waits under this stream's field. */
  const attach = useCallback(() => {
    const at = stream.current;

    if (cycling.current !== null) {
      return;
    }

    const config = held.current.config;
    const agent = config.agents.find((one) => one.id === aimed.current) ?? null;
    const ceiling = agent === null ? 0 : packCeiling(agentStands(agent, config, machine.current));
    const used = (stands.current.attachments[at] ?? []).reduce((sum, one) => sum + one.least, 0);

    // Room left under the aimed agent's ceiling; what could never fit is refused at once and never becomes a chip. With
    // no model to ask, nothing to count against.
    void pickAttachment(ceiling > 0 ? Math.max(0, ceiling - used) : null).then(
      (pick) => {
        if (pick.picked.length > 0) {
          change((was) => ({
            ...was,
            attachments: {
              ...was.attachments,
              [at]: [...(was.attachments[at] ?? []), ...pick.picked],
            },
          }));
        }

        if (pick.refused.length > 0) {
          refused.current(pick.refused.map(refusedPickNote).join("; "));
        }
      },
      // The chooser did not open: nothing picked.
      () => undefined,
    );
  }, [change]);

  /** The × on a chip: removes the attachment with that path before the question goes. */
  const detach = useCallback(
    (path: string) => {
      const at = stream.current;

      if (cycling.current !== null) {
        return;
      }

      change((standing) => ({
        ...standing,
        attachments: {
          ...standing.attachments,
          [at]: (standing.attachments[at] ?? []).filter((one) => one.path !== path),
        },
      }));
    },
    [change],
  );

  /** «СПИТАТИ ЩЕ РАЗ»: the same agent and question, in the existing record. */
  const sayAgain = useCallback(
    (said: ChatMessage) => {
      dispatch({
        kind: "sayAgain",
        said,
      });
    },
    [dispatch],
  );

  /** A fresh stream; a walk still out keeps writing into its record and its live row. */
  const fresh = useCallback(() => {
    turnCycle(null);
    dispatch({
      kind: "putAway",
      stream: freshStream,
    });
    // Ends the record, which otherwise goes on as long as the conversation.
    record.turnTo(null);
    setFreshStream(crypto.randomUUID());
  }, [dispatch, freshStream, record, turnCycle]);

  /**
   * Ends every turn of the on-screen walk in the main process, and the repeats with it; a stopped turn hands nothing on.
   * A put-away walk carries on.
   */
  const stop = useCallback(() => {
    turnCycle(null);
    dispatch({
      kind: "stopped",
      runKey: null,
    });
  }, [dispatch, turnCycle]);
  /** What this stream's walks stand on, as this render sees them. */
  const walk: WalkState = {
    ...walked,
    ledgers: writer.walks(),
    aimedAgentId,
    flowRunId: record.runId,
  };
  /** The aimed agent's turn the chat stands on; only this conversation's, at most one (one walk at a time). */
  const turn = Object.values(walk.out)
    .filter((standing) => standing.agentId === aimedAgentId && isOnScreen(walk, standing.runKey))
    .sort((one, other) => one.startedAt - other.startedAt)
    .at(0);

  const waiting = wordsAwaitingHand(walk);
  /** What has been shown already; only the dot over «ІСТОРІЯ» asks this. */
  const news = useNewsSeen(waiting.elsewhere, waiting.onScreen);

  return {
    /** An agent whose last turn fell and has said nothing since; one good turn clears it. */
    fellAt: fellAgents(walk),
    /**
     * A conversation not on screen holds a turn that waits for the hand; this session's news only, not what the record held
     * before.
     */
    isNewsElsewhere: news.isNewsElsewhere,
    /** The history was opened: no longer news. */
    readNews: news.readNews,
    /** The aim, or null when its agent was deleted from the project. */
    aimedAgentId: project.config.agents.some((agent) => agent.id === aimedAgentId) ? aimedAgentId : null,
    /** Aims without touching the canvas; opening a run points the chat at whoever walked it. */
    aim: setAimedAgentId,
    openCalls,
    fieldHeight,
    setFieldHeight,
    /** A fresh stream; a walk still out keeps writing into its record and its live row. */
    fresh,
    sayAgain,
    saidAgain: walked.saidAgain,
    /** The run this stream writes into, so the projection can open on it. */
    runId: record.runId,
    /** A run opened from history replaces the stream, and questions asked there continue that run. */
    goOnIn: (runId: string) => {
      record.turnTo(runId);
    },
    /**
     * A record deleted by hand takes its conversation with it: the stream is emptied if it wrote into that record, else
     * left alone.
     */
    letGo: (runId: string) => {
      if (record.standing() === runId) {
        fresh();
      }
    },
    messages: chatStream(walk),
    draft: walked.drafts[stream.current] ?? "",
    /** Attachments of the on-screen stream, waiting under the field. */
    attachments: walked.attachments[stream.current] ?? [],
    isWorking: turn !== undefined,
    /** Bumped by every step written and every run closed, so the history can follow. */
    written: record.written,
    startedAt: turn === undefined ? null : turn.startedAt,
    // Every turn out, not just the aimed agent's; the canvas draws them all, the chat each in its own block.
    working: workingTurns(walk),
    waiting: waitingAgents(walk),
    /** How each canvas line stands now: flowing, awaited, answered or silent. */
    linkLives: linkLives(project.config.links, walk),
    changeDraft,
    attach,
    detach,
    send,
    stop,
    repeats,
    setRepeats,
    repeating:
      cycle === null
        ? null
        : {
            sent: cycle.sent,
            total: cycle.total,
          },
  };
}
