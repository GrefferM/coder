import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import {
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
import { ToolArguments } from "./tool-arguments.service";
import { CommandWay } from "./command-way.service";
import { ServerWay } from "./server-way.service";
import { TurnLedger } from "./turn-ledger.service";
import { isCommandTool } from "../interfaces";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type {
  AgentAnswer,
  AgentClient,
  AgentKeyStore,
  AgentTool,
  AgentVoice,
  ChatTurn,
  ProjectMcpServer,
  ToolWay,
  ServerRunner,
  TurnCall,
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
  }): Promise<AgentAnswer> {
    const client = this.clients[payload.providerId] ?? null;

    if (client === null) {
      throw new Refusal(LLM_PROVIDER_NOT_BUILT);
    }

    const held = await this.opened(client, payload.providerId);
    const stopping = new AbortController();

    this.running.set(payload.turnId, stopping);

    const byName = new Map(payload.tools.map((tool) => [tool.name, tool]));
    const conversation = this.said(payload.systemPrompt, payload.messages);
    // The ceiling is written in tokens and goes to the provider as it stands — nothing is converted.
    const answering = this.answering(
      client.open({
        model: payload.model,
        key: held.key,
        address: held.address,
        temperature: payload.temperature,
        answerTokens: payload.answerCeiling,
      }),
      payload.tools,
    );
    const ledger = new TurnLedger();

    try {
      for (;;) {
        // The ceiling counts model rounds and tool runs alike.
        if (ledger.isSpent(payload.maxCalls)) {
          return ledger.answer({
            isCallsExhausted: true,
          });
        }

        ledger.spend();

        const round = await this.round(payload, answering, conversation, stopping.signal, ledger);

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

        if (ledger.wouldOverspend(asked.length, payload.maxCalls)) {
          return ledger.answer({
            isCallsExhausted: true,
          });
        }

        conversation.push(round.gathered);

        await this.ranCalls(payload, byName, asked, conversation, ledger);

        this.voice.say({
          turnId: payload.turnId,
          text: "",
          call: null,
        });
      }
    } catch {
      if (stopping.signal.aborted) {
        return ledger.answer({
          isStopped: true,
        });
      }

      // A fault of the provider's own is an end this app knows: it is answered, not reported.
      throw new Refusal(LLM_ASK_FAILED);
    } finally {
      this.running.delete(payload.turnId);
    }
  }

  /**
   * One round of the model: the pieces as they arrive, each said onward, counted and gathered into the whole.
   * The round says whether the ceiling cut it — by the provider's own word, or by its own count stopping
   * exactly on the number it was given.
   */
  private async round(
    payload: { turnId: string; answerCeiling: number },
    answering: Runnable<BaseMessage[], AIMessageChunk> | BaseChatModel,
    conversation: BaseMessage[],
    signal: AbortSignal,
    ledger: TurnLedger,
  ): Promise<{ gathered: AIMessageChunk | undefined; isCeilingHit: boolean }> {
    let gathered: AIMessageChunk | undefined;
    let roundTokens = 0;
    const pieces = await answering.stream(conversation, {
      signal,
    });

    for await (const piece of pieces) {
      const words = this.words(piece.content);
      const counted = this.counted(piece.usage_metadata?.output_tokens);

      ledger.heard(words, this.counted(piece.usage_metadata?.input_tokens), counted);
      roundTokens += counted;
      gathered = gathered === undefined ? piece : gathered.concat(piece);

      if (words !== "") {
        this.voice.say({
          turnId: payload.turnId,
          text: words,
          call: null,
        });
      }
    }

    return {
      gathered,
      isCeilingHit: this.hitCeiling(gathered) || this.reachedCeiling(roundTokens, payload.answerCeiling),
    };
  }

  /** Every call the round asked for, made in the order it asked; each is a call spent and a message back. */
  private async ranCalls(
    payload: { turnId: string; directory: string; servers: ProjectMcpServer[] },
    byName: Map<string, AgentTool>,
    asked: { id?: string; name: string; args: Record<string, unknown> }[],
    conversation: BaseMessage[],
    ledger: TurnLedger,
  ): Promise<void> {
    for (const call of asked) {
      const tool = byName.get(call.name) ?? null;
      const ran = await this.called(payload.turnId, payload.directory, payload.servers, tool, call);

      conversation.push(ran.message);

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
   * way's — a declared command's line, or a server's function.
   */
  private async called(
    turnId: string,
    directory: string,
    servers: ProjectMcpServer[],
    tool: AgentTool | null,
    call: { id?: string; name: string; args: Record<string, unknown> },
  ): Promise<{ message: ToolMessage; made: TurnCall | null }> {
    if (tool === null) {
      return this.notCalled(call, `[${call.name}: такої команди в агента немає]`);
    }

    const way = this.wayOf(servers, tool, call.args);

    if (way === null) {
      // The tools and the servers travel together; a function whose server is not among them is nobody's to call.
      return this.notCalled(call, SERVER_NOT_THERE_NOTE.replace(SERVER_NAME_SLOT, call.name));
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
      this.sayCall(turnId, refused, RUN_CALL_REFUSED);

      return {
        message: new ToolMessage(refused.refusal, call.id ?? call.name, call.name),
        made: refused,
      };
    }

    // The call is said the moment it goes out, and said again when it is over.
    this.sayCall(turnId, standing, RUN_CALL_RUNNING);

    const result = await way.make(standing.id, directory);
    const made = {
      ...standing,
      ...result,
      endedAt: Date.now(),
    };

    this.sayCall(turnId, made, made.isFailed ? RUN_CALL_SAID_NO : RUN_CALL_RAN);

    return {
      message: new ToolMessage(result.output, call.id ?? call.name, call.name),
      made,
    };
  }

  /** Which way this call goes, or nothing where a server's function names a server that did not travel with the ask. */
  private wayOf(servers: ProjectMcpServer[], tool: AgentTool, said: Record<string, unknown>): ToolWay | null {
    if (isCommandTool(tool)) {
      return new CommandWay(tool, said, this.tools, this.arguments_);
    }

    const server = servers.find((held) => held.id === tool.serverId) ?? null;

    return server === null ? null : new ServerWay(tool, server, said, this.servers);
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

  /** One call said to the person, out or over; the words are the answer's and never a call's. */
  private sayCall(turnId: string, made: TurnCall, state: string): void {
    this.voice.say({
      turnId,
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
