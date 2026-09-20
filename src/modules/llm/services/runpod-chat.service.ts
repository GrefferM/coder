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

/** One turn of the conversation as the endpoint's worker takes it. */
interface RunPodSaid {
  role: string;
  content: string;
}

/**
 * A model served by a RunPod serverless endpoint, reached through the queue that endpoint answers on. There is
 * no library for it and no OpenAI door on such an endpoint: a job is thrown into the queue, asked about until it
 * is over, and the answer is read out of it whole.
 *
 * Whole, and not word by word, on purpose. The queue does say the words as they are written — but a job asked to
 * stream never carries the token counts, neither in its pieces nor afterwards, and a turn whose tokens nobody
 * counted has no price to write down. The counts are worth more than the seconds: the sphere says «працює» and
 * counts them meanwhile, and the answer lands as one.
 *
 * The endpoint serves one model and the queue's job says nothing about which: the model's title in the project
 * is the person's own word for it, and it is not sent anywhere.
 */
export class RunPodChat extends BaseChatModel {
  constructor(private readonly opening: RunPodOpening) {
    super({});
  }

  _llmType(): string {
    return RUNPOD_CLIENT_NAME;
  }

  /** The whole turn: thrown into the queue, waited out, and read back with what it cost. */
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
            // The ceiling's own word, under the name every other provider says it by.
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

  /** The job thrown into the queue; what comes back is its id and nothing else. */
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

  /**
   * The job asked about until it is over. A hand on «ЗУПИНИТИ» takes the job off the queue as well: a job left
   * running answers to nobody and is paid for all the same.
   */
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
        // The worker's own words where it left any, and the status alone where it did not.
        throw new Error(`${RUNPOD_ENDED_PREFIX}${this.endedOn(stood, status)}`);
      }

      await new Promise((wake) => setTimeout(wake, RUNPOD_ASKED_EVERY_MS));
    }
  }

  /** The job taken off the queue; a queue that no longer has it says so, and there is nothing to answer to that. */
  private async dropped(jobId: string): Promise<void> {
    await this.asked(`${RUNPOD_CANCEL_PATH}${jobId}`, {
      method: "POST",
    }).catch(() => undefined);
  }

  /** One ask of the queue, with the key on it; a queue that refused answers with its own status and words. */
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
   * What a finished job holds: the worker answers with a list of its own, and the answer is its first. A job can
   * finish and still hold no answer — the worker writes down what its own insides refused, and that sentence is
   * the only thing worth saying to the person, so it is thrown rather than handed on as an empty turn.
   */
  private answerOf(output: unknown): RunPodAnswer {
    const held = Array.isArray(output) ? output[0] : output;
    const answer = <RunPodAnswer>(held ?? {});

    if (answer.choices === undefined || answer.choices.length === 0) {
      throw new Error(`${RUNPOD_ENDED_PREFIX}${this.refusalIn(held)}`);
    }

    return answer;
  }

  /** The worker's own words about a job that carried no answer: its `error`, the line itself, or all it wrote. */
  private refusalIn(held: unknown): string {
    if (typeof held === "string" && held !== "") {
      return held;
    }

    const said = (<Record<string, unknown>>(held ?? {})).error;

    return typeof said === "string" && said !== "" ? said : JSON.stringify(held ?? null);
  }

  /** Why a job ended where it did: the queue's own `error`, or the status it wears. */
  private endedOn(stood: Record<string, unknown>, status: string): string {
    const said = stood.error ?? stood.output;

    return typeof said === "string" && said !== "" ? said : status;
  }

  /** One message as the worker takes it; the roles are OpenAI's own, which is what its chat template reads. */
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
