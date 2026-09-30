import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import {
  AGENT_CYCLE_NOTE,
  AGENT_FELL_NOTE,
  AGENT_GONE_NOTE,
  AGENT_NAME_SLOT,
  AGENT_TOOL_INPUT_DESCRIPTION,
  AGENT_TOOL_INPUT_NAME,
  LLM_ASK_FAILED,
  LLM_CEILING_REASONS,
  LLM_CEILING_REASON_KEYS,
  SERVER_NAME_SLOT,
  SERVER_NOT_THERE_NOTE,
  TOOL_SCHEMA_OBJECT,
  TOOL_SCHEMA_TYPES,
} from "../constants";
import { LLM_NO_ADDRESS, LLM_NO_KEY, LLM_PROVIDER_NOT_BUILT, LLM_PROVIDER_SILENT } from "../../../contracts";
import { RUN_CALL_RAN, RUN_CALL_REFUSED, RUN_CALL_RUNNING, RUN_CALL_SAID_NO } from "../../../contracts";
import { Refusal } from "../../../utils/refusals";
import { AgentWay } from "./agent-way.service";
import { ToolArguments } from "./tool-arguments.service";
import { CommandWay } from "./command-way.service";
import { ServerWay } from "./server-way.service";
import { TurnLedger } from "./turn-ledger.service";
import { isAgentTool, isCommandTool } from "../interfaces";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type {
  AgentAgentTool,
  AgentAnswer,
  AgentClient,
  AgentKeyStore,
  AgentRun,
  AgentTool,
  AgentTurnOutcome,
  AgentVoice,
  ChatTurn,
  ProjectMcpServer,
  ToolWay,
  ServerRunner,
  TurnCall,
  ReachableAgent,
  RunningTurn,
  SubTurn,
  ToolRunner,
} from "../interfaces";

/** Runs one turn of an agent's chat, looping over calls up to the agent's maximum and streaming each piece. */
export class LlmService {
  /** In-flight turns by turnId; «ЗУПИНИТИ» aborts the call. */
  private readonly running = new Map<string, AbortController>();

  constructor(
    private readonly keys: AgentKeyStore,
    private readonly voice: AgentVoice,
    private readonly tools: ToolRunner,
    private readonly servers: ServerRunner,
    private readonly arguments_: ToolArguments,
    // Every provider the app knows, by id.
    private readonly clients: Record<string, AgentClient>,
  ) {}

  async ask(payload: {
    turnId: string;
    agentId: string;
    providerId: string;
    model: string;
    directory: string;
    maxCalls: number;
    temperature: number;
    answerCeiling: number;
    systemPrompt: string | null;
    messages: ChatTurn[];
    tools: AgentTool[];
    /** The reach of every server whose functions are among the tools, looked up by the tool's id. */
    servers: ProjectMcpServer[];
    /** Every agent reachable as a tool from this one, by id. */
    agents: ReachableAgent[];
  }): Promise<AgentAnswer> {
    const client = this.clients[payload.providerId] ?? null;

    if (client === null) {
      throw new Refusal(LLM_PROVIDER_NOT_BUILT);
    }

    const held = await this.opened(client, payload.providerId);
    const stopping = new AbortController();

    this.running.set(payload.turnId, stopping);

    try {
      return await this.turn({
        voicedAs: payload.turnId,
        answering: this.bound(client, held, payload),
        conversation: this.said(payload.systemPrompt, payload.messages),
        directory: payload.directory,
        maxCalls: payload.maxCalls,
        answerCeiling: payload.answerCeiling,
        byName: new Map(payload.tools.map((tool) => [tool.name, tool])),
        servers: payload.servers,
        signal: stopping.signal,
        reachable: new Map(payload.agents.map((agent) => [agent.agentId, agent])),
        stack: new Set([payload.agentId]),
      });
    } finally {
      this.running.delete(payload.turnId);
    }
  }

  /**
   * One turn's loop — a round of the model, then every call it asked for, until it asks for none or a ceiling
   * cuts it. A stop and a ceiling are ends too, each keeping what the turn had already said and done. A fault of
   * the provider's own is answered nowhere: it is thrown as the one refusal the app knows for it.
   */
  private async turn(turn: RunningTurn): Promise<AgentAnswer> {
    const ledger = new TurnLedger();

    try {
      for (;;) {
        // The ceiling counts model rounds and tool runs alike.
        if (ledger.isSpent(turn.maxCalls)) {
          return ledger.answer({
            isCallsExhausted: true,
          });
        }

        ledger.spend();

        const round = await this.round(turn, ledger);

        // A round the ceiling cut ends the turn: nothing it began saying or calling is finished.
        if (round.isCeilingHit) {
          return ledger.answer({
            isCeilingHit: true,
          });
        }

        const asked = round.gathered?.tool_calls ?? [];

        if (round.gathered === undefined || asked.length === 0) {
          return ledger.answer();
        }

        if (ledger.wouldOverspend(asked.length, turn.maxCalls)) {
          return ledger.answer({
            isCallsExhausted: true,
          });
        }

        turn.conversation.push(round.gathered);

        await this.ranCalls(turn, asked, ledger);

        // A stop that landed while a tool was running ends the turn here, before another round begins.
        if (turn.signal.aborted) {
          return ledger.answer({
            isStopped: true,
          });
        }

        if (turn.voicedAs !== null) {
          this.voice.say({
            turnId: turn.voicedAs,
            text: "",
            call: null,
          });
        }
      }
    } catch {
      if (turn.signal.aborted) {
        return ledger.answer({
          isStopped: true,
        });
      }

      // A fault of the provider's own is an end this app knows: it is answered, not reported.
      throw new Refusal(LLM_ASK_FAILED);
    }
  }

  /**
   * One round of the model: the pieces as they arrive, each said onward, counted and gathered into the whole.
   * The round says whether the ceiling cut it — by the provider's own word, or by its own count stopping
   * exactly on the number it was given.
   */
  private async round(
    turn: RunningTurn,
    ledger: TurnLedger,
  ): Promise<{ gathered: AIMessageChunk | undefined; isCeilingHit: boolean }> {
    let gathered: AIMessageChunk | undefined;
    let roundTokens = 0;
    const pieces = await turn.answering.stream(turn.conversation, {
      signal: turn.signal,
    });

    for await (const piece of pieces) {
      const words = this.words(piece.content);
      const counted = this.counted(piece.usage_metadata?.output_tokens);

      ledger.heard(words, this.counted(piece.usage_metadata?.input_tokens), counted);
      roundTokens += counted;
      gathered = gathered === undefined ? piece : gathered.concat(piece);

      if (words !== "" && turn.voicedAs !== null) {
        this.voice.say({
          turnId: turn.voicedAs,
          text: words,
          call: null,
        });
      }
    }

    return {
      gathered,
      isCeilingHit: this.hitCeiling(gathered) || this.reachedCeiling(roundTokens, turn.answerCeiling),
    };
  }

  /** Every call the round asked for, made in the order it asked; each is a call spent and a message back. */
  private async ranCalls(
    turn: RunningTurn,
    asked: { id?: string; name: string; args: Record<string, unknown> }[],
    ledger: TurnLedger,
  ): Promise<void> {
    for (const call of asked) {
      // A stop cuts the queue: a call not yet made is not made.
      if (turn.signal.aborted) {
        return;
      }

      const tool = turn.byName.get(call.name) ?? null;
      const ran = await this.called(turn, tool, call);

      turn.conversation.push(ran.message);

      if (ran.made !== null) {
        ledger.ran(ran.made);
      }

      ledger.spend();
    }
  }

  /** Aborts an in-flight turn; a finished turn is a no-op. */
  stop(payload: { turnId: string }): void {
    this.running.get(payload.turnId)?.abort();
  }

  /** The model with the agent's tools bound, or the plain model when there are none. */
  private answering(model: BaseChatModel, tools: AgentTool[]): Runnable<BaseMessage[], AIMessageChunk> | BaseChatModel {
    if (tools.length === 0 || model.bindTools === undefined) {
      return model;
    }

    return model.bindTools(tools.map((tool) => this.described(tool)));
  }

  /** One tool as an OpenAI-style function schema. */
  private described(tool: AgentTool): Record<string, unknown> {
    if (isAgentTool(tool)) {
      // An agent is called with one thing — a request in words — and the model reads its short description.
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: TOOL_SCHEMA_OBJECT,
            properties: {
              [AGENT_TOOL_INPUT_NAME]: {
                type: TOOL_SCHEMA_TYPES.text,
                description: AGENT_TOOL_INPUT_DESCRIPTION,
              },
            },
            required: [AGENT_TOOL_INPUT_NAME],
          },
        },
      };
    }

    if (!isCommandTool(tool)) {
      // A server published this schema; it goes to the model as it came, and this app rewrites none of it.
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      };
    }

    const properties: Record<string, unknown> = {};

    for (const parameter of tool.parameters) {
      properties[parameter.name] = {
        type: TOOL_SCHEMA_TYPES[parameter.type] ?? TOOL_SCHEMA_TYPES.text,
        description: parameter.description,
        ...(parameter.type === "enum" && parameter.values.length > 0
          ? {
              enum: parameter.values,
            }
          : {}),
      };
    }

    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: TOOL_SCHEMA_OBJECT,
          properties,
          required: tool.parameters.filter((parameter) => parameter.isRequired).map((parameter) => parameter.name),
        },
      },
    };
  }

  /**
   * One call, whichever kind it is. The envelope is one: the row is minted, said the moment it goes out, said
   * again when it is over, and handed to the model as a message. What differs is the middle, and that is the
   * way's — a declared command's line, a server's function, or a whole turn of another agent.
   */
  private async called(
    turn: RunningTurn,
    tool: AgentTool | null,
    call: { id?: string; name: string; args: Record<string, unknown> },
  ): Promise<{ message: ToolMessage; made: TurnCall | null }> {
    if (tool === null) {
      return this.notCalled(call, `[${call.name}: такої команди в агента немає]`);
    }

    const way = this.wayOf(turn, tool, call.args);

    if (way === null) {
      return this.notCalled(call, this.unreachedNote(tool));
    }

    const standing: TurnCall = {
      id: crypto.randomUUID(),
      ...way.standing(),
      line: "",
      output: "",
      refusal: "",
      exitCode: null,
      isFailed: false,
      startedAt: Date.now(),
      endedAt: 0,
    };
    const refusal = way.refusal();

    // The check before the line runs; a complaint runs nothing.
    if (refusal !== null) {
      const refused = {
        ...standing,
        // Nothing ran, so there is no line and no code — only what the check said.
        refusal,
        endedAt: Date.now(),
      };

      // The person sees the refusal as a row of its own, the model as a note.
      this.sayCall(turn, refused, RUN_CALL_REFUSED);

      return {
        message: new ToolMessage(refused.refusal, call.id ?? call.name, call.name),
        made: refused,
      };
    }

    // The call is said the moment it goes out, and said again when it is over.
    this.sayCall(turn, standing, RUN_CALL_RUNNING);

    const result = await way.make(standing.id, turn.directory, turn.signal);
    const made = {
      ...standing,
      ...result,
      endedAt: Date.now(),
    };

    this.sayCall(turn, made, made.isFailed ? RUN_CALL_SAID_NO : RUN_CALL_RAN);

    return {
      message: new ToolMessage(result.output, call.id ?? call.name, call.name),
      made,
    };
  }

  /** Which way this call goes, or nothing where what it reaches did not travel with the ask. */
  private wayOf(turn: RunningTurn, tool: AgentTool, said: Record<string, unknown>): ToolWay | null {
    if (isCommandTool(tool)) {
      return new CommandWay(tool, said, this.tools, this.arguments_);
    }

    if (isAgentTool(tool)) {
      return this.agentWay(turn, tool, said);
    }

    const server = turn.servers.find((held) => held.id === tool.serverId) ?? null;

    return server === null ? null : new ServerWay(tool, server, said, this.servers);
  }

  /** What the model is told of a tool whose server or agent did not travel with the ask. */
  private unreachedNote(tool: AgentTool): string {
    if (isAgentTool(tool)) {
      return AGENT_GONE_NOTE.replace(AGENT_NAME_SLOT, tool.name);
    }

    return SERVER_NOT_THERE_NOTE.replace(SERVER_NAME_SLOT, tool.name);
  }

  /** One agent called as a tool, or nothing where that agent did not travel with the ask. */
  private agentWay(turn: RunningTurn, tool: AgentAgentTool, said: Record<string, unknown>): ToolWay | null {
    const agent = turn.reachable.get(tool.agentId) ?? null;

    if (agent === null) {
      return null;
    }

    const request = String(said[AGENT_TOOL_INPUT_NAME] ?? "");

    return new AgentWay({
      tool,
      request,
      refusal: this.agentRefusal(turn, agent),
      run: (signal) =>
        this.subTurn({
          turn,
          agent,
          request,
          signal,
        }),
    });
  }

  /** What stops an agent's call before it runs: a ring it would close, or why it cannot run; nothing otherwise. */
  private agentRefusal(turn: RunningTurn, agent: ReachableAgent): string | null {
    if (turn.stack.has(agent.agentId)) {
      return AGENT_CYCLE_NOTE.replace(AGENT_NAME_SLOT, agent.name);
    }

    return agent.notReady;
  }

  /**
   * A sub-agent's whole turn, asked the one request: silent, under the caller's stop, with the sub-agent added to
   * the ring being watched. A fault of its provider is the call's outcome, as a server's is, not the caller's fall.
   */
  private async subTurn(asked: SubTurn): Promise<AgentTurnOutcome> {
    const { turn, agent, request, signal } = asked;

    // An agent that cannot run is refused before its call is made; this narrows it to one that can.
    if (agent.notReady !== null) {
      return this.fell(agent);
    }

    const client = this.clients[agent.providerId] ?? null;

    if (client === null) {
      return this.fell(agent);
    }

    try {
      const held = await this.opened(client, agent.providerId);
      const answer = await this.turn({
        voicedAs: null,
        answering: this.bound(client, held, agent),
        conversation: this.said(agent.systemPrompt, [
          {
            from: "person",
            text: request,
          },
        ]),
        directory: turn.directory,
        maxCalls: agent.maxCalls,
        answerCeiling: agent.answerCeiling,
        byName: new Map(agent.tools.map((tool) => [tool.name, tool])),
        servers: turn.servers,
        signal,
        reachable: turn.reachable,
        stack: new Set([...turn.stack, agent.agentId]),
      });

      return {
        text: answer.text,
        isFailed: false,
      };
    } catch {
      // A stop is the caller's, not a fault of this agent's; the caller's loop ends on it next.
      if (signal.aborted) {
        return {
          text: "",
          isFailed: false,
        };
      }

      return this.fell(agent);
    }
  }

  /** A sub-agent that could not run to an answer. */
  private fell(agent: ReachableAgent): AgentTurnOutcome {
    return {
      text: AGENT_FELL_NOTE.replace(AGENT_NAME_SLOT, agent.name),
      isFailed: true,
    };
  }

  /** The run's model opened on its provider, with its tools bound; the ceiling goes as it stands, in tokens. */
  private bound(
    client: AgentClient,
    held: { key: string | null; address: string | null },
    run: AgentRun,
  ): Runnable<BaseMessage[], AIMessageChunk> | BaseChatModel {
    const model = client.open({
      model: run.model,
      key: held.key,
      address: held.address,
      temperature: run.temperature,
      answerTokens: run.answerCeiling,
    });

    return this.answering(model, run.tools);
  }

  /** A call that never happened: the model is told in a note, and nothing is written down. */
  private notCalled(
    call: { id?: string; name: string },
    note: string,
  ): { message: ToolMessage; made: TurnCall | null } {
    return {
      message: new ToolMessage(note, call.id ?? call.name, call.name),
      made: null,
    };
  }

  /** One call said to the person, out or over; the words are the answer's and never a call's. A sub-agent says none. */
  private sayCall(turn: RunningTurn, made: TurnCall, state: string): void {
    if (turn.voicedAs === null) {
      return;
    }

    this.voice.say({
      turnId: turn.voicedAs,
      text: "",
      call: {
        ...made,
        state,
      },
    });
  }

  /**
   * Whether the provider's own count of this round stopped exactly at the ceiling. Some providers end a stream
   * with a chunk the client drops, and their word goes with it, leaving only the number. A count over the ceiling
   * says that provider never held to it, so nothing was cut.
   */
  private reachedCeiling(roundTokens: number, answerCeiling: number): boolean {
    return roundTokens > 0 && answerCeiling > 0 && roundTokens === answerCeiling;
  }

  /**
   * Whether this round stopped at the ceiling, by the provider's own reason and nothing else. Clients keep that word in
   * either pocket — Anthropic in `additional_kwargs` alone — so both are read, and neither is guessed at.
   */
  private hitCeiling(gathered: AIMessageChunk | undefined): boolean {
    const said = {
      ...(<Record<string, unknown>>(gathered?.additional_kwargs ?? {})),
      ...(<Record<string, unknown>>(gathered?.response_metadata ?? {})),
    };
    const reason = LLM_CEILING_REASON_KEYS.map((key) => said[key]).find((value) => typeof value === "string");

    return reason !== undefined && LLM_CEILING_REASONS.includes(reason.toLowerCase());
  }

  /** Everything the provider asked for, or a refusal naming the first of them that is missing. */
  private async opened(
    client: AgentClient,
    providerId: string,
  ): Promise<{ key: string | null; address: string | null }> {
    return {
      key: client.needs.includes("key") ? await this.heldKey(providerId) : null,
      address: client.needs.includes("address") ? await this.heldAddress(providerId) : null,
    };
  }

  /** The provider's key, or a refusal saying there is none. */
  private async heldKey(providerId: string): Promise<string> {
    const key = await this.keys.keyOf(providerId);

    if (key === null || key === "") {
      throw new Refusal(LLM_NO_KEY);
    }

    return key;
  }

  /** The provider's address, or a refusal: no address at all, or a machine that did not answer. */
  private async heldAddress(providerId: string): Promise<string> {
    const address = await this.keys.addressOf(providerId);

    if (address === null || address === "") {
      throw new Refusal(LLM_NO_ADDRESS);
    }

    // A local provider is pinged first: a silent one gets its own refusal. A remote one always reads as answering.
    if (!(await this.keys.isAnswering(providerId))) {
      throw new Refusal(LLM_PROVIDER_SILENT);
    }

    return address;
  }

  /** A provider's token count; `NaN` and non-numbers count as 0. */
  private counted(count: number | undefined): number {
    return typeof count === "number" && Number.isFinite(count) ? count : 0;
  }

  /** System prompt (if any), then the turns in order. */
  private said(systemPrompt: string | null, messages: ChatTurn[]): BaseMessage[] {
    const opening = systemPrompt === null || systemPrompt === "" ? [] : [new SystemMessage(systemPrompt)];
    const turns = messages.map((turn) =>
      turn.from === "person" ? new HumanMessage(turn.text) : new AIMessage(turn.text),
    );

    return [...opening, ...turns];
  }

  /** Text of a chunk; content arrives as one string or a list of parts. */
  private words(content: unknown): string {
    if (typeof content === "string") {
      return content;
    }

    if (!Array.isArray(content)) {
      return "";
    }

    return content
      .map((part) => (typeof part === "object" && part !== null && "text" in part ? String(part.text) : ""))
      .join("");
  }
}
