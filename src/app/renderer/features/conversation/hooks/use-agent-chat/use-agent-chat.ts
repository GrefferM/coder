import { useCallback, useEffect, useRef, useState } from "react";
import { forgetLive, sayPiece } from "../use-live-answer";
import { useNewsSeen } from "../use-news-seen";
import { useOpenCalls } from "../use-open-calls";
import {
  configureWalks,
  freshWalks,
  goOnInWalks,
  letGoWalks,
  openWalks,
  pickAttachment,
  putWalk,
  sayWalkAgain,
  stopWalks,
} from "../../api";
import { usePackedSend } from "../use-packed-send";
import {
  AGENT_CHUNK_CHANNEL,
  WALKS_CHANGED_CHANNEL,
  WALKS_HEARD_CHANNEL,
  WALKS_WRITTEN_CHANNEL,
} from "../../../../../../contracts";
import {
  agentStands,
  chatStream,
  emptyWalk,
  fellAgents,
  isOnScreen,
  isWalking,
  linkLives,
  packCeiling,
  wordsAwaitingHand,
  waitingAgents,
  walkBroke,
  workingTurns,
} from "../../logic";
import { refusedPickNote } from "../../words";
import { REPEAT_LEAST } from "../../constants";
import type {
  OpenProject,
  PackedAttachment,
  PickedAttachment,
  ProviderState,
  PutWalkAnswer,
} from "../../../../interfaces";
import type { ChatMessage, FieldReturn, QuestionToPut, WalkSnapshot } from "../../interfaces";
import type { HeardClip } from "../../../speech";
import type { AgentChatState, RepeatCycle } from "./interfaces";

/** What is typed and attached on this screen, by stream; the backend knows nothing of it. */
interface Screen {
  /** What is typed in each stream: the one on screen and every run opened in its place. */
  drafts: Record<string, string>;
  /** Files and folders attached in each stream, waiting under the field for the question to go. */
  attachments: Record<string, PickedAttachment[]>;
  /** Recordings made in each stream, waiting under the field for the question to go. */
  clips: Record<string, HeardClip[]>;
}

const EMPTY_SCREEN: Screen = {
  drafts: {},
  attachments: {},
  clips: {},
};

/**
 * Each agent's chat as the screen shows it: the walks are run by the backend and told back as a snapshot; what is
 * typed, attached or aimed at, and the repeats, stay here.
 */
export function useAgentChat(
  project: OpenProject,
  selectedAgentId: string | null,
  providers: ProviderState[],
  heard: (providerId: string, isAnswering: boolean) => void,
  /** Reports a pick that was not attached, and why, on the line over the canvas. */
  onRefused: (words: string) => void,
): AgentChatState {
  /** The stream with no record yet; «+ НОВИЙ ЧАТ» starts another with an empty field. */
  const [freshStream, setFreshStream] = useState(() => crypto.randomUUID());
  /** The walks as the backend last told them. */
  const [walked, setWalked] = useState<WalkSnapshot>(emptyWalk);
  // Mirrors state: a callback must read what the backend told last, not what the last render saw.
  const shown = useRef(walked);
  /** What is typed and attached, with a ref beside it for the same reason. */
  const [screened, setScreened] = useState<Screen>(EMPTY_SCREEN);
  const screen = useRef(screened);
  const held = useRef(project);
  const machine = useRef(providers);
  const refused = useRef(onRefused);
  const hearing = useRef(heard);
  /** The config the backend was last given, so it is told again only when the screen's differs. */
  const told = useRef<OpenProject["config"] | null>(null);
  /** How many times the record has been written to. */
  const [written, setWritten] = useState(0);
  /** Height of the field under the stream; a per-machine, per-project setting kept beside the canvas scale. */
  const [fieldHeight, setFieldHeight] = useState<number | null>(project.view?.fieldHeight ?? null);
  /** «x1»: how many times the next question goes in a row; kept after the repeats are done. */
  const [repeats, setRepeats] = useState(REPEAT_LEAST);
  /** The repeats under way; the field stays shut from the first send to the last walk's end. */
  const [cycle, setCycle] = useState<RepeatCycle | null>(null);
  const cycling = useRef(cycle);
  /** The repeats' walk the snapshot has shown at least once; a walk not shown yet is awaited, one gone is over. */
  const seen = useRef<string | null>(null);
  /** A question sent that the backend has not answered yet; a second one waits. */
  const putting = useRef(false);
  /** The recordings each question went with, by the question's id, for the person's card. */
  const [heardBy, setHeardBy] = useState<Record<string, HeardClip[]>>({});
  /** Remembers which calls a hand opened; nothing opens itself. */
  const openCalls = useOpenCalls();
  /** Whom the chat is aimed at; picking a sphere aims it, releasing the sphere keeps the aim. */
  const [aimedAgentId, setAimedAgentId] = useState<string | null>(project.view?.aimedAgentId ?? null);
  /** The stream on screen: the opened run, or the fresh one with no record yet. */
  const stream = useRef(walked.flowRunId ?? freshStream);

  held.current = project;
  machine.current = providers;
  refused.current = onRefused;
  hearing.current = heard;
  stream.current = walked.flowRunId ?? freshStream;

  useEffect(() => {
    if (selectedAgentId !== null) {
      setAimedAgentId(selectedAgentId);
    }
  }, [selectedAgentId]);

  /** Takes what the backend told: its words are the screen's, and a turn gone from it needs no more live words. */
  const show = useCallback((next: WalkSnapshot) => {
    for (const turn of Object.values(shown.current.out)) {
      if (next.out[turn.turnId] === undefined) {
        forgetLive(turn.turnId);
      }
    }

    shown.current = next;
    setWalked(next);
  }, []);

  /** Updates what is typed and attached and the ref with it, so the next callback sees the new one. */
  const change = useCallback((moved: (standing: Screen) => Partial<Screen>) => {
    screen.current = {
      ...screen.current,
      ...moved(screen.current),
    };
    setScreened(screen.current);
  }, []);

  /** Moves the repeats and the ref with them, so an effect never puts the same repeat twice. */
  const turnCycle = useCallback((next: RepeatCycle | null) => {
    cycling.current = next;
    setCycle(next);
  }, []);

  // The conversation of the open project begins in the backend; asked again for the same directory it keeps its walks.
  useEffect(() => {
    let isLive = true;
    const { config } = held.current;

    told.current = config;
    void openWalks(project.directory, config).then(
      (snapshot) => {
        if (isLive) {
          show(snapshot);
        }
      },
      () => undefined,
    );

    return () => {
      isLive = false;
    };
  }, [project.directory, show]);

  // Walks under way read the config as the screen holds it.
  useEffect(() => {
    if (told.current === null || told.current === project.config) {
      return;
    }

    told.current = project.config;
    void configureWalks(project.config).catch(() => undefined);
  }, [project.config]);

  // What the backend says back: the walks, a write to the record, a provider that answered or not, and the words
  // arriving; each piece names its turn and only that turn's card hears it.
  useEffect(() => window.electronApi.subscribe(WALKS_CHANGED_CHANNEL, show), [show]);
  useEffect(() => window.electronApi.subscribe(WALKS_WRITTEN_CHANNEL, () => setWritten((was) => was + 1)), []);
  useEffect(
    () =>
      window.electronApi.subscribe(WALKS_HEARD_CHANNEL, (said) => hearing.current(said.providerId, said.isAnswering)),
    [],
  );
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

  /** The stream on screen when a pack comes back; the question goes or waits there. */
  const streamNow = useCallback(() => stream.current, []);
  /** A question with files: packed first, then sent or given back. */
  const packed = usePackedSend(streamNow);

  /**
   * One walk from this question to the last step it reaches, written into the conversation's record (older than the
   * walk). The walk's id, or `null` when the backend took no question.
   */
  const put = useCallback(async (question: QuestionToPut): Promise<PutWalkAnswer | null> => {
    const { agent, text, attached, clips } = question;

    try {
      const answer = await putWalk({
        agentId: agent.id,
        text,
        attached,
        recordings: clips.map(({ id: _id, ...sound }) => sound),
      });

      if (answer !== null && clips.length > 0) {
        setHeardBy((standing) => ({
          ...standing,
          [answer.questionId]: clips,
        }));
      }

      return answer;
    } catch {
      return null;
    }
  }, []);

  /** A question that did not go returns to its field with its attachments and recordings; newer typed words stay. */
  const giveBack = useCallback(
    ({ at, text, picked, clips }: FieldReturn) => {
      change((standing) => ({
        drafts: {
          ...standing.drafts,
          [at]: (standing.drafts[at] ?? "") === "" ? text : standing.drafts[at],
        },
        attachments: {
          ...standing.attachments,
          [at]: [...picked, ...(standing.attachments[at] ?? [])],
        },
        clips: {
          ...standing.clips,
          [at]: [...clips, ...(standing.clips[at] ?? [])],
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
    const text = (screen.current.drafts[at] ?? "").trim();
    const agent = held.current.config.agents.find((standing) => standing.id === agentId) ?? null;

    // An agent switched off is still asked: the walk says why the question stayed.
    if (text === "" || agent === null) {
      return;
    }

    // The conversation is walking or still packing, so nothing is sent; typed text stays until the walk ends or
    // «ЗУПИНИТИ».
    if (isWalking(shown.current) || packed.isPacking(at) || cycling.current !== null || putting.current) {
      return;
    }

    const picked = screen.current.attachments[at] ?? [];
    const clips = screen.current.clips[at] ?? [];
    const returned: FieldReturn = {
      at,
      text,
      picked,
      clips,
    };

    // The question, its files and its recordings leave the field together, which is left clear.
    change((standing) => ({
      drafts: {
        ...standing.drafts,
        [at]: "",
      },
      attachments: {
        ...standing.attachments,
        [at]: [],
      },
      clips: {
        ...standing.clips,
        [at]: [],
      },
    }));
    // The first of the repeats; none for a plain send. The field is shut from here, packing included.
    turnCycle(
      repeats > REPEAT_LEAST
        ? {
            agentId,
            text,
            attached: [],
            runKey: null,
            sent: 1,
            total: repeats,
          }
        : null,
    );

    /** Puts the first question; the walk's id opens the repeats, no walk gives the question back. */
    const go = (attached: PackedAttachment[]): void => {
      putting.current = true;
      void put({
        agent,
        text,
        attached,
        clips,
      }).then((answer) => {
        putting.current = false;

        if (answer === null) {
          turnCycle(null);
          giveBack(returned);

          return;
        }

        const runKey = answer.walkId;

        // Stopped while packing, there are no repeats left and the question goes alone.
        if (cycling.current !== null) {
          turnCycle({
            ...cycling.current,
            attached,
            runKey,
          });
        }
      });
    };

    if (picked.length === 0) {
      go([]);

      return;
    }

    packed.send({
      stream: at,
      text,
      picked,
      ceiling: packCeiling(agentStands(agent, held.current.config, machine.current)),
      onPacked: go,
      onGivenBack: () => {
        turnCycle(null);
        giveBack(returned);
      },
    });
  }, [aimedAgentId, change, giveBack, packed, put, repeats, turnCycle]);

  // A whole walk puts the same question again until the count is reached; a broken, stopped or left walk ends the
  // repeats.
  useEffect(() => {
    const going = cycling.current;

    if (going === null || going.runKey === null) {
      return;
    }

    const now = shown.current;
    const walk = now.walks[going.runKey] ?? null;

    // The backend has not told of this walk yet: it is awaited, not over.
    if (walk === null && seen.current !== going.runKey) {
      return;
    }

    seen.current = going.runKey;

    if (isOnScreen(now, going.runKey) && isWalking(now)) {
      return;
    }

    const agent = held.current.config.agents.find((one) => one.id === going.agentId) ?? null;

    if (agent === null || going.sent >= going.total || !isOnScreen(now, going.runKey) || walkBroke(walk)) {
      turnCycle(null);

      return;
    }

    // Shut on the next walk until the backend names it, so the effect never puts one repeat twice.
    const next = {
      ...going,
      runKey: null,
      sent: going.sent + 1,
    };

    turnCycle(next);
    void put({
      agent,
      text: going.text,
      attached: going.attached,
      clips: [],
    }).then((answer) => {
      if (cycling.current !== next) {
        return;
      }

      turnCycle(
        answer === null
          ? null
          : {
              ...next,
              runKey: answer.walkId,
            },
      );
    });
  }, [cycle, put, turnCycle, walked]);

  /** «+ ПРИКРІПИТИ»: opens the native pick; the choice waits under this stream's field. */
  const attach = useCallback(() => {
    const at = stream.current;

    if (cycling.current !== null) {
      return;
    }

    const config = held.current.config;
    const agent = config.agents.find((one) => one.id === aimedAgentId) ?? null;
    const ceiling = agent === null ? 0 : packCeiling(agentStands(agent, config, machine.current));
    const used = (screen.current.attachments[at] ?? []).reduce((sum, one) => sum + one.least, 0);

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
  }, [aimedAgentId, change]);

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

  /** A recording just heard goes under the on-screen stream's field, to go with the next question. */
  const addClip = useCallback(
    (clip: HeardClip) => {
      const at = stream.current;

      change((standing) => ({
        clips: {
          ...standing.clips,
          [at]: [...(standing.clips[at] ?? []), clip],
        },
      }));
    },
    [change],
  );

  /** The × on a recording's chip: its sound goes, the words it left in the field stay. */
  const dropClip = useCallback(
    (clipId: string) => {
      const at = stream.current;

      change((standing) => ({
        clips: {
          ...standing.clips,
          [at]: (standing.clips[at] ?? []).filter((one) => one.id !== clipId),
        },
      }));
    },
    [change],
  );

  /** «СПИТАТИ ЩЕ РАЗ»: the same agent and question, in the existing record. */
  const sayAgain = useCallback((said: ChatMessage) => {
    void sayWalkAgain(said).catch(() => undefined);
  }, []);

  /** The screen is emptied: no repeats, what was typed in the fresh stream gone, another fresh stream in its place. */
  const empty = useCallback(() => {
    turnCycle(null);
    change((standing) => ({
      ...standing,
      drafts: Object.fromEntries(Object.entries(standing.drafts).filter(([at]) => at !== freshStream)),
    }));
    setFreshStream(crypto.randomUUID());
  }, [change, freshStream, turnCycle]);

  /** A fresh stream; a walk still out keeps writing into its record and its live row. */
  const fresh = useCallback(() => {
    empty();
    void freshWalks().catch(() => undefined);
  }, [empty]);

  /**
   * Ends every turn of the on-screen walk in the backend, and the repeats with it; a stopped turn hands nothing on. A
   * put-away walk carries on.
   */
  const stop = useCallback(() => {
    turnCycle(null);
    void stopWalks().catch(() => undefined);
  }, [turnCycle]);

  /** A run opened from history replaces the stream, and questions asked there continue that run. */
  const goOnIn = useCallback((runId: string) => {
    void goOnInWalks(runId).catch(() => undefined);
  }, []);

  /** A record deleted by hand takes its conversation: the stream is emptied if it wrote into that record. */
  const letGo = useCallback(
    (runId: string) => {
      if (shown.current.flowRunId === runId) {
        empty();
      }

      void letGoWalks(runId).catch(() => undefined);
    },
    [empty],
  );

  /** The aimed agent's turn the chat stands on; only this conversation's, at most one (one walk at a time). */
  const turn = Object.values(walked.out)
    .filter((standing) => standing.agentId === aimedAgentId && isOnScreen(walked, standing.runKey))
    .sort((one, other) => one.startedAt - other.startedAt)
    .at(0);

  const waiting = wordsAwaitingHand(walked);
  /** What has been shown already; only the dot over «ІСТОРІЯ» asks this. */
  const news = useNewsSeen(waiting.elsewhere, waiting.onScreen);

  return {
    /** An agent whose last turn fell and has said nothing since; one good turn clears it. */
    fellAt: fellAgents(walked),
    isNewsElsewhere: news.isNewsElsewhere,
    readNews: news.readNews,
    /** The aim, or null when its agent was deleted from the project. */
    aimedAgentId: project.config.agents.some((agent) => agent.id === aimedAgentId) ? aimedAgentId : null,
    /** Aims without touching the canvas; opening a run points the chat at whom it was last asked. */
    aim: setAimedAgentId,
    openCalls,
    fieldHeight,
    setFieldHeight,
    fresh,
    sayAgain,
    saidAgain: walked.saidAgain,
    runId: walked.flowRunId,
    goOnIn,
    letGo,
    messages: chatStream(walked),
    draft: screened.drafts[stream.current] ?? "",
    attachments: screened.attachments[stream.current] ?? [],
    clips: screened.clips[stream.current] ?? [],
    heardBy,
    isWorking: turn !== undefined,
    /** Bumped by every step written and every run closed, so the history can follow. */
    written,
    startedAt: turn === undefined ? null : turn.startedAt,
    // Every turn out on screen, not just the aimed agent's; the canvas draws them all, the chat each in its own block.
    working: workingTurns(walked),
    waiting: waitingAgents(walked),
    /** How each canvas line stands: flowing, awaited, answered or silent. */
    linkLives: linkLives(project.config.links, walked),
    changeDraft,
    attach,
    detach,
    addClip,
    dropClip,
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
