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
} from "./provider-ids.constant";
import type { AgentClient } from "../interfaces";

/** The address with `/v1` appended unless it already ends in it. */
function atProtocol(address: string): string {
  const machine = address.replace(/\/+$/, "");

  return machine.endsWith(OPENAI_PROTOCOL_PATH) ? machine : `${machine}${OPENAI_PROTOCOL_PATH}`;
}

/** Every provider the app knows and how each is opened. */
export const AGENT_CLIENTS: Record<string, AgentClient> = {
  [ANTHROPIC_PROVIDER_ID]: {
    needs: "key",
    open: (model, apiKey, temperature, answerTokens) =>
      new ChatAnthropic({
        apiKey,
        model,
        temperature,
        maxTokens: answerTokens,
      }),
  },
  [OPENAI_PROVIDER_ID]: {
    needs: "key",
    open: (model, apiKey, temperature, answerTokens) =>
      new ChatOpenAI({
        apiKey,
        model,
        temperature,
        maxTokens: answerTokens,
      }),
  },
  [OPENROUTER_PROVIDER_ID]: {
    needs: "key",
    open: (model, apiKey, temperature, answerTokens) =>
      new ChatOpenRouter({
        apiKey,
        model,
        temperature,
        maxTokens: answerTokens,
        // OpenRouter returns usage counts only when asked.
        modelKwargs: {
          usage: {
            include: true,
          },
        },
      }),
  },
  [GOOGLE_PROVIDER_ID]: {
    needs: "key",
    open: (model, apiKey, temperature, answerTokens) =>
      new ChatGoogleGenerativeAI({
        apiKey,
        model,
        temperature,
        maxOutputTokens: answerTokens,
      }),
  },
  [OLLAMA_PROVIDER_ID]: {
    needs: "address",
    open: (model, address, temperature, answerTokens) =>
      new ChatOllama({
        baseUrl: address,
        model,
        temperature,
        numPredict: answerTokens,
      }),
  },
  [LMSTUDIO_PROVIDER_ID]: {
    needs: "address",
    open: (model, address, temperature, answerTokens) =>
      new ChatOpenAI({
        apiKey: LMSTUDIO_ANY_KEY,
        model,
        temperature,
        maxTokens: answerTokens,
        configuration: {
          baseURL: atProtocol(address),
        },
      }),
  },
};
