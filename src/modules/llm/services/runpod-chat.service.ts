import { AIMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  RUNPOD_ASKED_EVERY_MS,
  RUNPOD_CANCEL_PATH,
  RUNPOD_CLIENT_NAME,
  RUNPOD_DONE,
  RUNPOD_ENDED_PREFIX,
  RUNPOD_REFUSED_PREFIX,
  RUNPOD_REFUSED_SEPARATOR,
  RUNPOD_RUN_PATH,
  RUNPOD_STATUS_PATH,
  RUNPOD_WAITING,
} from "../constants";
import type { BaseMessage } from "@langchain/core/messages";
import type { ChatResult } from "@langchain/core/outputs";
import type { RunPodOpening } from "../interfaces";

interface RunPodSaid {
  role: string;
  content: string;
}

/**
 * A model served by a RunPod serverless endpoint, reached through its queue: a job is submitted, polled until over, and
 * the answer read whole. Not streamed: a streamed job carries no token counts, so the turn would have no price. The
 * endpoint serves one model; the project's model title is never sent.
 */
export class RunPodChat extends BaseChatModel {
  constructor(private readonly opening: RunPodOpening) {
    super({});
  }

  _llmType(): string {
    return RUNPOD_CLIENT_NAME;
  }

  /** The whole turn: submitted to the queue, waited out, read back with its cost. */
  async _generate(messages: BaseMessage[], options: this["ParsedCallOptions"]): Promise<ChatResult> {
    const jobId = await this.thrown(messages, options.signal);
    const answer = await this.waited(jobId, options.signal);
    const said = answer.choices?.[0];
    const usage = answer.usage ?? null;

    return {
      generations: [
        {
          text: said?.message?.content ?? "",
          message: new AIMessage({
            content: said?.message?.content ?? "",
            // The ceiling reason, under the name every other provider uses.
            response_metadata: {
              finish_reason: said?.finish_reason ?? null,
            },
            usage_metadata: {
              input_tokens: usage?.prompt_tokens ?? 0,
              output_tokens: usage?.completion_tokens ?? 0,
              total_tokens: usage?.total_tokens ?? 0,
            },
          }),
        },
      ],
    };
  }

  private async thrown(messages: BaseMessage[], signal: AbortSignal | undefined): Promise<string> {
    const thrown = await this.asked(RUNPOD_RUN_PATH, {
      method: "POST",
      signal,
      body: JSON.stringify({
        input: {
          messages: messages.map((message) => this.saidBy(message)),
          sampling_params: {
            max_tokens: this.opening.answerTokens,
            temperature: this.opening.temperature,
          },
        },
      }),
    });

    return String(thrown.id ?? "");
  }

  /** Polls the job until over. A stop also takes the job off the queue, since a running one is paid for anyway. */
  private async waited(jobId: string, signal: AbortSignal | undefined): Promise<RunPodAnswer> {
    for (;;) {
      if (signal?.aborted === true) {
        await this.dropped(jobId);
        signal.throwIfAborted();
      }

      const stood = await this.asked(`${RUNPOD_STATUS_PATH}${jobId}`, {
        method: "GET",
      });
      const status = String(stood.status ?? "");

      if (status === RUNPOD_DONE) {
        return this.answerOf(stood.output);
      }

      if (!RUNPOD_WAITING.includes(status)) {
        // The worker's own words where it left any, else the status alone.
        throw new Error(`${RUNPOD_ENDED_PREFIX}${this.endedOn(stood, status)}`);
      }

      await new Promise((wake) => setTimeout(wake, RUNPOD_ASKED_EVERY_MS));
    }
  }

  /** Takes the job off the queue; a queue that no longer has it is ignored. */
  private async dropped(jobId: string): Promise<void> {
    await this.asked(`${RUNPOD_CANCEL_PATH}${jobId}`, {
      method: "POST",
    }).catch(() => undefined);
  }

  /** One ask of the queue, with the key; a refusal carries the queue's status and words. */
  private async asked(path: string, sent: RequestInit): Promise<Record<string, unknown>> {
    const answer = await fetch(`${this.opening.address}${path}`, {
      ...sent,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.opening.key}`,
      },
    });
    const said = await answer.text();

    if (!answer.ok) {
      throw new Error(`${RUNPOD_REFUSED_PREFIX}${answer.status}${RUNPOD_REFUSED_SEPARATOR}${said}`);
    }

    return <Record<string, unknown>>JSON.parse(said);
  }

  /**
   * What a finished job holds: the worker's list, whose first item is the answer. A finished job may hold only the
   * worker's own refusal, which is thrown rather than returned as an empty turn.
   */
  private answerOf(output: unknown): RunPodAnswer {
    const held = Array.isArray(output) ? output[0] : output;
    const answer = <RunPodAnswer>(held ?? {});

    if (answer.choices === undefined || answer.choices.length === 0) {
      throw new Error(`${RUNPOD_ENDED_PREFIX}${this.refusalIn(held)}`);
    }

    return answer;
  }

  /** The worker's words about a job without an answer: its `error`, the line itself, or everything it wrote. */
  private refusalIn(held: unknown): string {
    if (typeof held === "string" && held !== "") {
      return held;
    }

    const said = (<Record<string, unknown>>(held ?? {})).error;

    return typeof said === "string" && said !== "" ? said : JSON.stringify(held ?? null);
  }

  /** Why a job ended: the queue's `error` or `output` where it is words, else its status. */
  private endedOn(stood: Record<string, unknown>, status: string): string {
    const said = stood.error ?? stood.output;

    return typeof said === "string" && said !== "" ? said : status;
  }

  /** One message as the worker takes it; roles are OpenAI's, which its chat template reads. */
  private saidBy(message: BaseMessage): RunPodSaid {
    const kind = message.getType();

    return {
      role: kind === "human" ? "user" : kind === "ai" ? "assistant" : kind,
      content: typeof message.content === "string" ? message.content : JSON.stringify(message.content),
    };
  }
}

/** The worker's answer, in the shape its OpenAI-speaking insides give it. */
interface RunPodAnswer {
  choices?: { message?: { content?: string }; finish_reason?: string }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}
