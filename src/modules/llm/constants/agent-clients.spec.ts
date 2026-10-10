import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { AGENT_CLIENTS } from "./agent-clients.constant";
import { OPENCODE_PROVIDER_ID } from "./provider-ids.constant";
import { OPENCODE_PROTOCOL_ROOT, OPENCODE_ROOT } from "./opencode.constant";

function opened(model: string): unknown {
  return AGENT_CLIENTS[OPENCODE_PROVIDER_ID].open({
    model,
    key: "oc-key",
    address: null,
    temperature: 0,
    answerTokens: 1_000,
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
