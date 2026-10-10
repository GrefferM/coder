import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { AGENT_CLIENTS } from "./agent-clients.constant";
import { OPENCODE_PROVIDER_ID } from "./provider-ids.constant";
import {
  OPENCODE_PROTOCOL_ROOT,
  OPENCODE_ROOT,
  OPENCODE_SESSION_HEADER,
  OPENCODE_USER_AGENT,
} from "./opencode.constant";

function opened(model: string): unknown {
  return AGENT_CLIENTS[OPENCODE_PROVIDER_ID].open({
    model,
    key: "oc-key",
    address: null,
    temperature: 0,
    answerTokens: 1_000,
    session: "chat-1",
  });
}

describe("the OpenCode Go client", () => {
  it("asks for a key and nothing else", () => {
    assert.deepEqual(AGENT_CLIENTS[OPENCODE_PROVIDER_ID].needs, ["key"]);
  });

  it("opens a Claude model on the Anthropic protocol at its own address, under the name the request carries", () => {
    const model = opened("opencode-go/claude-haiku-5-5");

    assert.ok(model instanceof ChatAnthropic);
    assert.equal(model.model, "claude-haiku-5-5");
    assert.equal(model.apiUrl, OPENCODE_ROOT);
  });

  it("opens a GPT model on the responses protocol", () => {
    const model = opened("gpt-6-luna");

    assert.ok(model instanceof ChatOpenAI);
    assert.equal(model.useResponsesApi, true);
    assert.equal(model.clientConfig.baseURL, OPENCODE_PROTOCOL_ROOT);
  });

  it("opens any other model on chat completions", () => {
    const model = opened("kimi-k3");

    assert.ok(model instanceof ChatOpenAI);
    assert.equal(model.useResponsesApi, false);
    assert.equal(model.clientConfig.baseURL, OPENCODE_PROTOCOL_ROOT);
  });
});

describe("the OpenCode Go client on the wire", () => {
  afterEach(() => {
    globalThis.fetch = undefined as unknown as typeof fetch;
  });

  /** One call of the model with the network stood in for; what went out is returned. */
  async function sent(model: string): Promise<{ url: string; headers: Headers }> {
    const out: { url: string; headers: Headers }[] = [];

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      out.push({
        url: String(url),
        headers: new Headers(init?.headers),
      });

      return new Response("{}", {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }) as typeof fetch;

    const client = AGENT_CLIENTS[OPENCODE_PROVIDER_ID].open({
      model,
      key: "oc-key",
      address: null,
      temperature: 0,
      answerTokens: 1_000,
      session: "chat-7",
    });

    await (client as { invoke: (input: string) => Promise<unknown> }).invoke("питання").catch(() => undefined);

    return out[0];
  }

  it("names the conversation and itself on a chat completions call", async () => {
    const call = await sent("kimi-k3");

    assert.equal(call.url, `${OPENCODE_PROTOCOL_ROOT}/chat/completions`);
    assert.equal(call.headers.get(OPENCODE_SESSION_HEADER), "chat-7");
    assert.equal(call.headers.get("user-agent"), OPENCODE_USER_AGENT);
  });

  it("names the conversation and itself on a messages call", async () => {
    const call = await sent("claude-haiku-5-5");

    assert.equal(call.url, `${OPENCODE_PROTOCOL_ROOT}/messages`);
    assert.equal(call.headers.get(OPENCODE_SESSION_HEADER), "chat-7");
    assert.equal(call.headers.get("user-agent"), OPENCODE_USER_AGENT);
  });

  it("names the conversation and itself on a responses call", async () => {
    const call = await sent("grok-4.7");

    assert.equal(call.url, `${OPENCODE_PROTOCOL_ROOT}/responses`);
    assert.equal(call.headers.get(OPENCODE_SESSION_HEADER), "chat-7");
    assert.equal(call.headers.get("user-agent"), OPENCODE_USER_AGENT);
  });
});
