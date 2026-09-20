import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOpenRouter } from "@langchain/openrouter";
import {
  ANTHROPIC_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  LMSTUDIO_ANY_KEY,
  LMSTUDIO_PROVIDER_ID,
  OLLAMA_PROVIDER_ID,
  OPENAI_PROTOCOL_PATH,
  OPENAI_PROVIDER_ID,
  OPENROUTER_PROVIDER_ID,
  RUNPOD_PROVIDER_ID,
} from "./provider-ids.constant";
import { RunPodChat } from "../services/runpod-chat.service";
import type { AgentClient } from "../interfaces";

/** The address with `/v1` appended unless it already ends in it. */
function atProtocol(address: string | null): string {
  const machine = (address ?? "").replace(/\/+$/, "");

  return machine.endsWith(OPENAI_PROTOCOL_PATH) ? machine : `${machine}${OPENAI_PROTOCOL_PATH}`;
}

/** Every provider the app knows and how each is opened. */
export const AGENT_CLIENTS: Record<string, AgentClient> = {
  [ANTHROPIC_PROVIDER_ID]: {
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
    needs: ["key"],
    open: (opening) =>
      new ChatGoogleGenerativeAI({
        apiKey: opening.key ?? undefined,
        model: opening.model,
        temperature: opening.temperature,
        maxOutputTokens: opening.answerTokens,
      }),
  },
  [RUNPOD_PROVIDER_ID]: {
    /**
     * A serverless endpoint of the person's own, reached through its queue: the key is theirs and the address
     * carries the endpoint's id, so both are asked for. The address is taken as it stands — the queue's paths
     * hang off it, and OpenAI's `/v1` is not one of them.
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
  [OLLAMA_PROVIDER_ID]: {
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
    needs: ["address"],
    open: (opening) =>
      new ChatOpenAI({
        apiKey: LMSTUDIO_ANY_KEY,
        model: opening.model,
        temperature: opening.temperature,
        maxTokens: opening.answerTokens,
        configuration: {
          baseURL: atProtocol(opening.address),
        },
      }),
  },
};
