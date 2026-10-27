import { randomUUID } from "node:crypto";
import {
  NO_MEMORY,
  RECORD_GONE_NOTE,
  agentStands,
  composedMemory,
  isWalking,
  memoryLength,
  keepsMemory,
  sharesMemory,
} from "../../../contracts";
import {
  agentRegistry,
  agentThread,
  threadCovers,
  answeredCard,
  askedCards,
  emptyWalk,
  followersOf,
  grantedServerIds,
  handoffCard,
  repeatOf,
  unreadTurn,
  walkMachine,
} from "../logic";
import { RecordWriter } from "./record-writer.service";
import { TurnAsker } from "./turn-asker.service";
import type {
  Agent,
  ChatMessage,
  GrantTargets,
  McpLook,
  PutTurn,
  RunLedger,
  TurnMemory,
  WalkAct,
  WalkEffect,
  WalkEvent,
  WalkState,
} from "../../../contracts";
import type {
  ArrivedTurn,
  MemoryToRead,
  ProviderLister,
  PutQuestion,
  RecordWatcher,
  RunRecord,
  ServerLooker,
  WalkListener,
  WalkProject,
  WalkRunnerParts,
} from "../interfaces";

/**
 * One conversation's walks in a project: the machine decides, and this carries out what it asks for — turns put to the
 * model layer, the record written, the words said. A person's question begins a walk that goes on down the lines until
 * every point has spoken.
 */
export class WalkRunner implements RecordWatcher {
  private state: WalkState = emptyWalk();
  /** The row this conversation writes into; one conversation is one row, and a new chat ends it. */
  private flowRunId: string | null = null;
  private freshStream = randomUUID();
  private readonly project: WalkProject;
  private readonly record: RunRecord;
  private readonly providers: ProviderLister;
  private readonly servers: ServerLooker;
  private readonly listener: WalkListener;
  private readonly asker: TurnAsker;
  private readonly writer: RecordWriter;
  /** Who waits for the next change of the conversation. */
  private readonly waiting: Array<() => void> = [];

  constructor(parts: WalkRunnerParts) {
    this.project = parts.project;
    this.record = parts.record;
    this.providers = parts.providers;
    this.servers = parts.servers;
    this.listener = parts.listener;
    this.asker = new TurnAsker(parts.llm);
    this.writer = new RecordWriter(this.record, this);
  }

  snapshot(): WalkState {
    return {
      ...this.state,
      ledgers: this.writer.walks(),
      flowRunId: this.flowRunId,
    };
  }

  /** The row this conversation writes into, or null while it has none. */
  runId(): string | null {
    return this.flowRunId;
  }

  /** Whether a walk is out, so a second question does not go. */
  isBusy(): boolean {
    return isWalking(this.snapshot());
  }

  /** Begins a walk from the person's question; returns the walk's id. */
  put(question: PutQuestion): string {
    const runKey = randomUUID();

    this.dispatch({
      kind: "put",
      agent: question.agent,
      text: question.text,
      attached: question.attached,
      fedFrom: [],
      isAgain: false,
      questionId: randomUUID(),
      runKey,
      askedAt: Date.now(),
      turnId: randomUUID(),
    });

    return runKey;
  }

  /** Ends every turn of the walks on screen; a stopped turn hands nothing on. */
  stop(): void {
    this.dispatch({
      kind: "stopped",
      runKey: null,
    });
  }

  /** «СПИТАТИ ЩЕ РАЗ» under one card. */
  sayAgain(said: ChatMessage): void {
    this.dispatch({
      kind: "sayAgain",
      said,
    });
  }

  /** A fresh stream; a walk still out keeps writing into its record. */
  fresh(): void {
    this.dispatch({
      kind: "putAway",
      stream: this.freshStream,
    });
    this.goOnIn(null);
    this.freshStream = randomUUID();
  }

  /** Questions asked from now on continue this run, or start a new one where there is none. */
  goOnIn(runId: string | null): void {
    this.flowRunId = runId;
    this.writer.forgetOpening();
    this.announce();
  }

  /** The conversation is emptied if it wrote into the run, which was deleted by hand. */
  letGo(runId: string): void {
    if (this.flowRunId === runId) {
      this.fresh();
    }
  }

  /** Resolves once no walk is out and everything written has landed or been refused. */
  async whenIdle(): Promise<void> {
    while (this.isBusy()) {
      await this.nextChange();
    }

    await this.writer.settled();
  }

  learnRow(runKey: string, runId: string): void {
    // A conversation with no row takes the first one a walk of it opens.
    if (this.flowRunId === null) {
      this.flowRunId = runId;
    }

    this.dispatch({
      kind: "rowOpened",
      runKey,
      runId,
    });
  }

  forgetRow(runId: string): void {
    if (this.flowRunId === runId) {
      this.flowRunId = null;
      this.announce();
    }
  }

  isPutAway(runKey: string): boolean {
    return this.state.walks[runKey]?.isPutAway === true;
  }

  written(): void {
    this.listener.written();
  }

  /** Tells one fact to the walk, stores what it became, then carries out its effects. */
  private dispatch(event: WalkEvent): void {
    const { state, effects } = walkMachine(this.snapshot(), event, this.project.configNow());

    this.state = state;
    this.announce();

    for (const effect of effects) {
      this.carryOut(effect);
    }
  }

  private announce(): void {
    this.listener.changed(this.snapshot());

    for (const wake of this.waiting.splice(0)) {
      wake();
    }
  }

  private nextChange(): Promise<void> {
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  /** An effect's kind names the hand that answers it. */
  private carryOut(effect: WalkEffect): void {
    switch (effect.kind) {
      case "askAgent":
        return this.askAgent(effect);
      case "askMachine":
        return this.askMachine(effect);
      case "stopMachine":
        return this.asker.stop(effect.turnId);
      case "letDown":
        return this.letDown(effect);
      case "sayHandoff":
        return this.sayHandoff(effect);
      case "sayAsked":
        return this.sayAsked(effect);
      case "sayAnswer":
        return this.sayAnswer(effect);
      case "writeTurn":
        return this.writeTurn(effect);
      case "turnBack":
        return this.turnBack(effect);
      case "openWalk":
        return this.openWalk(effect);
      case "takeWalk":
        return this.takeWalk(effect);
      case "askAgain":
        return void this.askAgain(effect);
      case "dropWalk":
        return this.writer.drop(effect.runKey);
      case "closeAgain":
        return this.closeAgain(effect);
    }
  }

  /** Writes a word into the walk that said it, by walk id. */
  private sayIn(runKey: string, moved: (was: ChatMessage[]) => ChatMessage[]): void {
    const walk = this.state.walks[runKey];

    if (walk === undefined) {
      return;
    }

    this.state = {
      ...this.state,
      walks: {
        ...this.state.walks,
        [runKey]: {
          ...walk,
          said: moved(walk.said),
        },
      },
    };
    this.announce();
  }

  /** Work put to an agent: the machine decides whether the turn goes out or the row says why not. */
  private askAgent(act: WalkAct<"askAgent">): void {
    this.dispatch({
      kind: "asked",
      agent: act.agent,
      incoming: act.incoming,
      startAgentId: act.startAgentId,
      viaLinkIds: act.viaLinkIds,
      runKey: act.runKey,
      isAgain: act.isAgain,
      missing: act.missing,
      turnId: randomUUID(),
      startedAt: Date.now(),
    });
  }

  /** An agent that will not answer lets down whoever waits for it. */
  private letDown(act: WalkAct<"letDown">): void {
    this.dispatch({
      kind: "released",
      fromId: act.fromId,
      startAgentId: act.startAgentId,
      runKey: act.runKey,
    });
  }

  private sayHandoff(act: WalkAct<"sayHandoff">): void {
    this.sayIn(act.runKey, (standing) => [
      ...standing,
      handoffCard({
        id: randomUUID(),
        runKey: act.runKey,
        fromAgentId: act.fromAgentId,
        toAgentId: act.toAgentId,
        stopReason: act.stopReason,
        questionId: act.questionId,
        askedAt: act.askedAt,
        at: Date.now(),
      }),
    ]);
  }

  private sayAsked(act: WalkAct<"sayAsked">): void {
    this.sayIn(act.runKey, (standing) => [
      ...standing,
      ...askedCards({
        ids: act.incoming.map(() => randomUUID()),
        runKey: act.runKey,
        agentId: act.agentId,
        incoming: act.incoming,
        questionId: act.questionId,
        askedAt: act.askedAt,
        at: Date.now(),
        isAgain: act.isAgain,
      }),
    ]);
  }

  private sayAnswer(act: WalkAct<"sayAnswer">): void {
    this.sayIn(act.runKey, (standing) => [...standing, answeredCard(act.turn)]);
  }

  /** Begins a walk: the writer takes it and its question is written when asked. */
  private openWalk(act: WalkAct<"openWalk">): void {
    const ledger = this.ledgerOf(act);

    this.writer.hold(act.runKey, ledger);

    void this.writer
      .askQuestion({
        ledger,
        directory: this.project.directory,
        agent: act.agent,
        text: act.asked,
        attached: act.attached,
        runKey: act.runKey,
      })
      .then(
        () =>
          this.dispatch({
            kind: "questionWritten",
            runKey: act.runKey,
          }),
        (failure: unknown) =>
          this.dispatch({
            kind: "questionUnsaved",
            runKey: act.runKey,
            failure: this.wordsOf(failure),
          }),
      );
  }

  /** A walk picked up from the record: the writer takes it, no question is written. */
  private takeWalk(act: WalkAct<"takeWalk">): void {
    this.writer.hold(
      act.runKey,
      this.ledgerOf({
        runKey: act.runKey,
        askedAt: act.askedAt,
        runId: act.runId,
        questionId: act.questionId,
      }),
    );
    // The repeat writes into the row it was pressed on; if the conversation moved on, it stays there.
    this.learnRow(act.runKey, act.runId);
  }

  private ledgerOf(walk: Pick<WalkAct<"openWalk">, "runKey" | "askedAt" | "runId" | "questionId">): RunLedger {
    return {
      walkId: walk.runKey,
      askedAt: walk.askedAt,
      runId: walk.runId,
      questionId: walk.questionId,
      out: 0,
      stepIdOf: {},
      queue: Promise.resolve(),
    };
  }

  /** Writes one finished turn as a step; the card takes the step's id and the walk goes on from it. */
  private writeTurn(act: WalkAct<"writeTurn">): void {
    const { runKey, saidId, turn } = act;
    const ledger = this.writer.walks()[runKey] ?? null;

    if (ledger === null) {
      this.dispatch({
        kind: "stepUnsaved",
        runKey,
        saidId,
        failure: RECORD_GONE_NOTE,
      });

      return;
    }

    void this.writer.writeTurn(ledger, runKey, turn).then(
      (stepId) => this.stepWritten(runKey, saidId, stepId),
      (failure: unknown) =>
        this.dispatch({
          kind: "stepUnsaved",
          runKey,
          saidId,
          failure: this.wordsOf(failure),
        }),
    );
  }

  private stepWritten(runKey: string, saidId: string, stepId: string): void {
    this.sayIn(runKey, (standing) =>
      standing.map((said) =>
        said.id === saidId
          ? {
              ...said,
              stepId,
            }
          : said,
      ),
    );
    this.dispatch({
      kind: "stepWritten",
      runKey,
      saidId,
    });
  }

  /** One turn of a walk is back; the run ends when the last one is, at the moment the walk ended. */
  private turnBack(act: WalkAct<"turnBack">): void {
    const { runKey } = act;
    const ledger = this.writer.walks()[runKey] ?? null;

    if (ledger === null) {
      return;
    }

    // A walk whose question never went has no turn out and is over as soon as it is said.
    ledger.out = Math.max(0, ledger.out - 1);

    if (ledger.out > 0) {
      return;
    }

    const endedAt = Date.now();

    this.writer.drop(runKey);

    void this.writer
      .closeWalk(ledger, runKey, endedAt)
      .catch((failure: unknown) => this.closeUnsaved(ledger, act, endedAt, failure));
  }

  private closeUnsaved(ledger: RunLedger, act: WalkAct<"turnBack">, endedAt: number, failure: unknown): void {
    if (ledger.runId === null) {
      return;
    }

    this.dispatch({
      kind: "closeUnsaved",
      runKey: act.runKey,
      closing: {
        runId: ledger.runId,
        endedAt,
      },
      failure: this.wordsOf(failure),
    });
  }

  /** Stamps a walk's end again, after the record refused it. */
  private closeAgain(act: WalkAct<"closeAgain">): void {
    void this.record.close(act.closing.runId, act.closing.endedAt).then(
      () =>
        this.dispatch({
          kind: "walkClosed",
          runKey: act.runKey,
        }),
      (failure: unknown) =>
        this.dispatch({
          kind: "closeUnsaved",
          runKey: act.runKey,
          closing: act.closing,
          failure: this.wordsOf(failure),
        }),
    );
  }

  /** Reads the run back and resumes the broken walk. */
  private async askAgain(act: WalkAct<"askAgain">): Promise<void> {
    // The record must hold what broke a moment ago.
    await this.writer.settled(act.walkId ?? "");

    try {
      const run = await this.record.read(act.runId);
      const repeat = run === null ? null : repeatOf(run, act.questionId, act.notSentTo, randomUUID());

      this.dispatch(
        repeat ?? {
          kind: "recordUnread",
          saidId: act.saidId,
          failure: RECORD_GONE_NOTE,
        },
      );
    } catch (failure) {
      this.dispatch({
        kind: "recordUnread",
        saidId: act.saidId,
        failure: this.wordsOf(failure),
      });
    }
  }

  /** Sends the turn the machine named: the run counts it and the model layer is asked. */
  private askMachine(put: PutTurn): void {
    const ledger = this.writer.walks()[put.runKey] ?? null;

    // One more turn of this run is out; the run ends when the last comes back.
    if (ledger !== null) {
      ledger.out += 1;
    }

    void this.arrivedFor(put, ledger).then((arrived) => this.arrived(put, arrived));
  }

  private async arrivedFor(put: PutTurn, ledger: RunLedger | null): Promise<ArrivedTurn> {
    try {
      return await this.asked(put, ledger);
    } catch (failure) {
      return {
        answered: unreadTurn(this.wordsOf(failure)),
        carried: 0,
        isAsked: false,
        model: null,
      };
    }
  }

  private async asked(put: PutTurn, ledger: RunLedger | null): Promise<ArrivedTurn> {
    const config = this.project.configNow();
    const providers = await this.providers.list();
    const stands = agentStands(put.agent, config, providers);
    // A put-away walk keeps writing into the row it began in; every other walk uses the conversation's row.
    const row = ledger?.runId ?? this.flowRunId;
    const memory = await this.memoryOf({
      runId: row,
      questionId: put.questionId,
      agent: put.agent,
    });
    const catalogue: GrantTargets = {
      commands: config.commands,
      servers: config.servers,
      looks: await this.looksFor(put.agent),
      agents: config.agents,
    };
    const answered = await this.asker.answer({
      turnId: put.turnId,
      agent: put.agent,
      stands,
      asked: put.asked,
      memory,
      catalogue,
      agents: agentRegistry(put.agent, config, providers, catalogue),
      followers: followersOf(config, put.agent),
      directory: this.project.directory,
      runId: row,
      questionId: put.questionId,
    });

    return {
      answered,
      carried: memoryLength(memory),
      isAsked: true,
      model: stands.model,
    };
  }

  /** The turn is back: the provider is heard, and the machine is told. */
  private arrived(put: PutTurn, arrived: ArrivedTurn): void {
    const { answered, carried, isAsked, model } = arrived;

    // A turn that reached the address, or was refused by silence there, updates the dot; other refusals never got that far.
    if (isAsked && model !== null && (answered.notStarted === null || answered.notStarted === "silent")) {
      this.listener.heard({
        providerId: model.provider,
        isAnswering: answered.notStarted === null,
      });
    }

    this.dispatch({
      kind: "answered",
      agent: put.agent,
      turnId: put.turnId,
      runKey: put.runKey,
      incoming: put.incoming,
      startAgentId: put.startAgentId,
      asked: put.asked,
      // A turn the ceiling refused keeps the memory its card counted, so a record read back counts it the same.
      memoryLength: answered.wouldGo?.memory ?? answered.compressed?.carried ?? carried,
      answer: answered,
      saidId: randomUUID(),
      startedAt: put.startedAt,
      endedAt: Date.now(),
    });
  }

  /**
   * The memory this agent goes with, read from the record after every walk's writes settle: its own thread, or what has
   * happened to the question so far; nothing without a row or with the memory switched off.
   */
  private async memoryOf(reading: MemoryToRead): Promise<TurnMemory> {
    const { runId, questionId, agent } = reading;

    if (runId === null || !keepsMemory(agent.memory)) {
      return NO_MEMORY;
    }

    await this.writer.settled();

    if (sharesMemory(agent.memory)) {
      return this.sharedMemoryOf(runId, questionId, agent.id);
    }

    // Only the latest compression and the agent's steps after it are read, not the whole run.
    const own = await this.record.ownThread(runId, agent.id);

    if (own === null) {
      throw new Error(RECORD_GONE_NOTE);
    }

    // Where the thread was compressed, the composer's message stands in front of the pairs that came after it.
    return {
      thread: agentThread(own.steps, agent, own.composed),
      composed: composedMemory(own.composed?.text ?? null),
      shared: "",
      covers: threadCovers(own.steps, agent, own.composed),
    };
  }

  private async sharedMemoryOf(runId: string, questionId: string, agentId: string): Promise<TurnMemory> {
    const shared = await this.record.sharedMemory(runId, questionId, agentId);

    if (shared === null) {
      throw new Error(RECORD_GONE_NOTE);
    }

    return {
      thread: [],
      composed: "",
      shared: shared.text,
      covers: shared.coversPlace,
    };
  }

  /** What each server the agent, or any agent it reaches, is granted functions of hands over now. */
  private async looksFor(agent: Agent): Promise<Record<string, McpLook>> {
    const config = this.project.configNow();
    const ids = grantedServerIds(agent, config);
    const held = config.servers.filter((server) => ids.includes(server.id));
    const looks = await Promise.all(held.map((server) => this.servers.look(server, this.project.directory)));

    return Object.fromEntries(looks.map((look) => [look.serverId, look]));
  }

  private wordsOf(failure: unknown): string {
    return failure instanceof Error ? failure.message : String(failure);
  }
}
