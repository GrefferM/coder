import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import {
  AGENT_ASKED_SLOT,
  AGENT_CEILING_SLOT,
  AGENT_CYCLE_NOTE,
  AGENT_GONE_NOTE,
  AGENT_MEMORY_SLOT,
  AGENT_MODEL_SLOT,
  AGENT_NAME_SLOT,
  AGENT_PROMPT_SLOT,
  AGENT_TOO_LONG_NOTE,
  AGENT_TOTAL_SLOT,
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
import {
  LLM_NO_ADDRESS,
  LLM_NO_KEY,
  LLM_PROVIDER_NOT_BUILT,
  LLM_PROVIDER_SILENT,
  RECORD_GONE_NOTE,
} from "../../../contracts";
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
  ReadyAgent,
  RunMemory,
  RunningTurn,
  SubTurn,
  ToolRunner,
  TurnQuestion,
} from "../interfaces";

/** Runs one turn of an agent's chat: loops over calls up to the agent's maximum, streaming each piece. */
export class LlmService {
  /** In-flight turns by turnId; «ЗУПИНИТИ» aborts the call. */
  private readonly running = new Map<string, AbortController>();

  constructor(
    private readonly keys: AgentKeyStore,
    private readonly voice: AgentVoice,
    private readonly tools: ToolRunner,
    private readonly servers: ServerRunner,
    // The record, read for the shared memory of an agent called as a tool.
    private readonly memory: RunMemory,
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
    /** The reach of every server whose functions are among the tools, by tool id. */
    servers: ProjectMcpServer[];
    /** Every agent reachable as a tool from this one, by id. */
    agents: ReachableAgent[];
    runId: string | null;
    questionId: string;
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
        question: {
          runId: payload.runId,
          questionId: payload.questionId,
        },
      });
    } finally {
      this.running.delete(payload.turnId);
    }
  }

  /**
   * One turn's loop: a round of the model, then every call it asked for, until it asks for none or a ceiling cuts it. A
   * stop and a ceiling end the turn, keeping what was said and done. A provider fault is thrown as the app's one refusal
   * for it.
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

        // A round cut by the ceiling ends the turn; nothing it began is finished.
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

        // A stop during a tool ends the turn before another round.
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
    } catch (failure) {
      if (turn.signal.aborted) {
        return ledger.answer({
          isStopped: true,
        });
      }

      // A provider fault is thrown as a refusal the app knows, not reported; the provider's own sentence rides after the
      // code, and nothing else of the library's error object (its headers and cookies) leaves.
      throw new Refusal(LLM_ASK_FAILED, messageOf(failure));
    }
  }

  /**
   * One round of the model: pieces are said onward, counted and gathered. Reports a ceiling cut, by the provider's word
   * or by its count landing exactly on the ceiling.
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

  /** Every call the round asked for, in order; each spends a call and returns a message. */
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
      // An agent is called with one thing, a request in words; the model reads its short description.
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
      // A server's published schema goes to the model as it came.
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
   * One call of any kind. The envelope is shared: the row is minted, said on going out and again when over, and handed to
   * the model as a message; the middle belongs to the way (command line, server function or another agent's turn).
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
        // Nothing ran: no line or code, only what the check said.
        refusal,
        endedAt: Date.now(),
      };

      // The person sees the refusal as a row, the model as a note.
      this.sayCall(turn, refused, RUN_CALL_REFUSED);

      return {
        message: new ToolMessage(refused.refusal, call.id ?? call.name, call.name),
        made: refused,
      };
    }

    // Said when it goes out and again when it is over.
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

  /** Which way this call goes, or `null` where its target did not travel with the ask. */
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

  /** Told to the model about a tool whose server or agent did not travel with the ask. */
  private unreachedNote(tool: AgentTool): string {
    if (isAgentTool(tool)) {
      return AGENT_GONE_NOTE.replace(AGENT_NAME_SLOT, tool.name);
    }

    return SERVER_NOT_THERE_NOTE.replace(SERVER_NAME_SLOT, tool.name);
  }

  /** One agent called as a tool, or `null` where that agent did not travel with the ask. */
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

  /** What stops an agent's call before it runs: a ring it would close, or why it cannot run; `null` otherwise. */
  private agentRefusal(turn: RunningTurn, agent: ReachableAgent): string | null {
    if (turn.stack.has(agent.agentId)) {
      return AGENT_CYCLE_NOTE.replace(AGENT_NAME_SLOT, agent.name);
    }

    return agent.notReady;
  }

  /**
   * A sub-agent's whole turn for the one request: silent, under the caller's stop, added to the watched ring. With the
   * shared memory it reads the caller's question; otherwise it gets the request alone. Whatever stops it — the record,
   * the ceiling, the provider — is the call's outcome in its own words, not the caller's fall.
   */
  private async subTurn(asked: SubTurn): Promise<AgentTurnOutcome> {
    const { turn, agent, request, signal } = asked;

    // Narrows to an agent that can run; one that cannot was refused before the call was made.
    if (agent.notReady !== null) {
      return this.failed(agent.notReady);
    }

    const client = this.clients[agent.providerId] ?? null;

    if (client === null) {
      return this.failed(LLM_PROVIDER_NOT_BUILT);
    }

    try {
      const memory = await this.sharedFor(agent, turn.question);

      if (memory === null) {
        return this.failed(RECORD_GONE_NOTE);
      }

      const tooLong = this.tooLong(agent, memory, request);

      if (tooLong !== null) {
        return this.failed(tooLong);
      }

      const held = await this.opened(client, agent.providerId);
      const answer = await this.turn({
        voicedAs: null,
        answering: this.bound(client, held, agent),
        conversation: this.said(agent.systemPrompt, [
          {
            from: "person",
            // One input: the memory opens the request.
            text: `${memory}${request}`,
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
        question: turn.question,
      });

      return {
        text: answer.text,
        isFailed: false,
      };
    } catch (failure) {
      // A stop is the caller's, not this agent's fault; the caller's loop ends on it next.
      if (signal.aborted) {
        return {
          text: "",
          isFailed: false,
        };
      }

      return this.failed(messageOf(failure));
    }
  }

  /** The question's shared memory, read now, for an agent that has it; nothing otherwise. Null where the record lost it. */
  private async sharedFor(agent: ReadyAgent, question: TurnQuestion): Promise<string | null> {
    if (agent.memory !== "shared" || question.runId === null) {
      return "";
    }

    return this.memory.sharedMemory(question.runId, question.questionId);
  }

  /** What would have gone, against the agent's model's ceiling, in characters; `null` where it fits. */
  private tooLong(agent: ReadyAgent, memory: string, request: string): string | null {
    const prompt = characters(agent.systemPrompt ?? "");
    const remembered = characters(memory);
    const asked = characters(request);
    const total = prompt + remembered + asked;

    if (total <= agent.contextCeiling) {
      return null;
    }

    return AGENT_TOO_LONG_NOTE.replace(AGENT_NAME_SLOT, agent.name)
      .replace(AGENT_MODEL_SLOT, agent.model)
      .replace(AGENT_TOTAL_SLOT, String(total))
      .replace(AGENT_PROMPT_SLOT, String(prompt))
      .replace(AGENT_MEMORY_SLOT, String(remembered))
      .replace(AGENT_ASKED_SLOT, String(asked))
      .replace(AGENT_CEILING_SLOT, String(agent.contextCeiling));
  }

  /** A sub-agent's call that came to nothing, with the words of whatever stopped it. */
  private failed(said: string): AgentTurnOutcome {
    return {
      text: said,
      isFailed: true,
    };
  }

  /** The run's model opened on its provider with its tools bound; the ceiling goes as it stands, in tokens. */
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

  /** A call that never happened: the model gets a note, nothing is recorded. */
  private notCalled(
    call: { id?: string; name: string },
    note: string,
  ): { message: ToolMessage; made: TurnCall | null } {
    return {
      message: new ToolMessage(note, call.id ?? call.name, call.name),
      made: null,
    };
  }

  /** Says one call to the person, out or over; a sub-agent says none. */
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
   * Whether the provider's token count for this round stopped exactly at the ceiling. A count over the ceiling means the
   * provider ignored it, so nothing was cut.
   */
  private reachedCeiling(roundTokens: number, answerCeiling: number): boolean {
    return roundTokens > 0 && answerCeiling > 0 && roundTokens === answerCeiling;
  }

  /**
   * Whether this round stopped at the ceiling by the provider's own reason. The word sits in either place on the client
   * (Anthropic in `additional_kwargs` alone), so both are read.
   */
  private hitCeiling(gathered: AIMessageChunk | undefined): boolean {
    const said = {
      ...(<Record<string, unknown>>(gathered?.additional_kwargs ?? {})),
      ...(<Record<string, unknown>>(gathered?.response_metadata ?? {})),
    };
    const reason = LLM_CEILING_REASON_KEYS.map((key) => said[key]).find((value) => typeof value === "string");

    return reason !== undefined && LLM_CEILING_REASONS.includes(reason.toLowerCase());
  }

  /** Everything the provider asked for, or a refusal naming the first missing item. */
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

  /** The provider's address, or a refusal: no address, or a machine that did not answer. */
  private async heldAddress(providerId: string): Promise<string> {
    const address = await this.keys.addressOf(providerId);

    if (address === null || address === "") {
      throw new Refusal(LLM_NO_ADDRESS);
    }

    // A local provider is pinged first; a remote one always reads as answering.
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

  /** Text of a chunk; content is one string or a list of parts. */
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

/** A text's length in code points, as the ceiling is counted on the screen. */
function characters(text: string): number {
  return [...text].length;
}

/** What a caught failure says: an error's message alone, never the object behind it. */
function messageOf(failure: unknown): string {
  return failure instanceof Error ? failure.message : String(failure);
}
