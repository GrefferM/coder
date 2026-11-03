import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOpenRouter } from "@langchain/openrouter";
import {
  OPENCODE_MESSAGES,
  OPENCODE_PROTOCOL_ROOT,
  OPENCODE_RESPONSES,
  OPENCODE_ROOT,
  OPENCODE_SESSION_HEADER,
  OPENCODE_USER_AGENT,
} from "./opencode.constant";
import {
  ANTHROPIC_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  LMSTUDIO_ANY_KEY,
  LMSTUDIO_PROVIDER_ID,
  OLLAMA_PROVIDER_ID,
  OPENAI_PROTOCOL_PATH,
  OPENAI_PROVIDER_ID,
  OPENCODE_PROVIDER_ID,
  OPENROUTER_PROVIDER_ID,
  RUNPOD_OPENAI_PROTOCOL_PATH,
  RUNPOD_OPENAI_PROVIDER_ID,
  RUNPOD_QUEUE_PROVIDER_ID,
} from "./provider-ids.constant";
import { opencodeModelName, opencodeProtocolOf } from "../logic";
import { RUNPOD_OPENAI_FAILURE_HINT } from "./runpod.constant";
import { RunPodChat } from "../services/runpod-chat.service";
import type { AgentClient } from "../interfaces";

/** The address with the protocol's path on its end, once, whatever trailing slashes it was written with. */
function atProtocol(address: string | null, protocolPath: string): string {
  const machine = (address ?? "").replace(/\/+$/, "");

  return machine.endsWith(protocolPath) ? machine : `${machine}${protocolPath}`;
}

/** A call that says who makes it: the OpenAI client puts its own library's name on the header, whatever it is given. */
const asCoder: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);

  headers.set("User-Agent", OPENCODE_USER_AGENT);

  return fetch(input, {
    ...init,
    headers,
  });
};

export const AGENT_CLIENTS: Record<string, AgentClient> = {
  [ANTHROPIC_PROVIDER_ID]: {
    failureHint: null,
    needs: ["key"],
    open: (opening) =>
      new ChatAnthropic({
        apiKey: opening.key ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
      }),
  },
  [OPENAI_PROVIDER_ID]: {
    failureHint: null,
    needs: ["key"],
    open: (opening) =>
      new ChatOpenAI({
        apiKey: opening.key ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
      }),
  },
  [OPENROUTER_PROVIDER_ID]: {
    failureHint: null,
    needs: ["key"],
    open: (opening) =>
      new ChatOpenRouter({
        apiKey: opening.key ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
        // OpenRouter returns usage counts only when asked.
        modelKwargs: {
          usage: {
            include: true,
          },
        },
      }),
  },
  [GOOGLE_PROVIDER_ID]: {
    failureHint: null,
    needs: ["key"],
    open: (opening) =>
      new ChatGoogleGenerativeAI({
        apiKey: opening.key ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        maxOutputTokens: opening.answerTokens,
      }),
  },
  [OPENCODE_PROVIDER_ID]: {
    failureHint: null,
    /** The person's OpenCode Go subscription: one key, and the protocol follows from the model's name. */
    needs: ["key"],
    open: (opening) => {
      const protocol = opencodeProtocolOf(opening.model);
      const model = opencodeModelName(opening.model);
      const session = {
        [OPENCODE_SESSION_HEADER]: opening.session,
      };

      if (protocol === OPENCODE_MESSAGES) {
        return new ChatAnthropic({
          apiKey: opening.key ?? undefined,
          anthropicApiUrl: OPENCODE_ROOT,
          clientOptions: {
            defaultHeaders: {
              ...session,
              "User-Agent": OPENCODE_USER_AGENT,
            },
          },
          model,
          temperature: opening.temperature,
          maxTokens: opening.answerTokens,
        });
      }

      return new ChatOpenAI({
        apiKey: opening.key ?? undefined,
        model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
        useResponsesApi: protocol === OPENCODE_RESPONSES,
        configuration: {
          baseURL: OPENCODE_PROTOCOL_ROOT,
          defaultHeaders: session,
          fetch: asCoder,
        },
      });
    },
  },
  [RUNPOD_QUEUE_PROVIDER_ID]: {
    failureHint: null,
    /**
     * A serverless endpoint of the person's own, reached through its queue: the key is theirs and the address carries the
     * endpoint's id. The address is taken as it stands, with no `/v1`.
     */
    needs: ["key", "address"],
    open: (opening) =>
      new RunPodChat({
        address: (opening.address ?? "").replace(/\/+$/, ""),
        key: opening.key ?? "",
        temperature: opening.temperature,
        answerTokens: opening.answerTokens,
      }),
  },
  [RUNPOD_OPENAI_PROVIDER_ID]: {
    failureHint: RUNPOD_OPENAI_FAILURE_HINT,
    /**
     * The same endpoint over the OpenAI protocol it serves: the key is the person's, the address the endpoint's root, and
     * the model's name is sent and must be the one the endpoint lists.
     */
    needs: ["key", "address"],
    open: (opening) =>
      new ChatOpenAI({
        apiKey: opening.key ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
        configuration: {
          baseURL: atProtocol(opening.address, RUNPOD_OPENAI_PROTOCOL_PATH),
        },
      }),
  },
  [OLLAMA_PROVIDER_ID]: {
    failureHint: null,
    needs: ["address"],
    open: (opening) =>
      new ChatOllama({
        baseUrl: opening.address ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        numPredict: opening.answerTokens,
      }),
  },
  [LMSTUDIO_PROVIDER_ID]: {
    failureHint: null,
    needs: ["address"],
    open: (opening) =>
      new ChatOpenAI({
        apiKey: LMSTUDIO_ANY_KEY,
        model: opening.model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
        configuration: {
          baseURL: atProtocol(opening.address, OPENAI_PROTOCOL_PATH),
        },
      }),
  },
};
