import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { opencodeModelName, opencodeProtocolOf } from "./opencode-model";
import { OPENCODE_CHAT, OPENCODE_MESSAGES, OPENCODE_RESPONSES } from "../constants";

describe("opencodeProtocolOf", () => {
  it("reaches Claude, MiniMax and Qwen by messages", () => {
    assert.equal(opencodeProtocolOf("claude-haiku-5-5"), OPENCODE_MESSAGES);
    assert.equal(opencodeProtocolOf("minimax-m3"), OPENCODE_MESSAGES);
    assert.equal(opencodeProtocolOf("qwen3.8-max"), OPENCODE_MESSAGES);
  });

  it("reaches GPT, Grok and Muse by responses", () => {
    assert.equal(opencodeProtocolOf("gpt-6-luna"), OPENCODE_RESPONSES);
    assert.equal(opencodeProtocolOf("grok-4.7"), OPENCODE_RESPONSES);
    assert.equal(opencodeProtocolOf("muse-spark-1.3-contributor"), OPENCODE_RESPONSES);
  });

  it("reaches every other model by chat completions", () => {
    assert.equal(opencodeProtocolOf("kimi-k3"), OPENCODE_CHAT);
    assert.equal(opencodeProtocolOf("deepseek-v4-pro"), OPENCODE_CHAT);
    assert.equal(opencodeProtocolOf("glm-5.3"), OPENCODE_CHAT);
    assert.equal(opencodeProtocolOf("something-new"), OPENCODE_CHAT);
  });

  it("ignores the case and the provider written in front of the name", () => {
    assert.equal(opencodeProtocolOf("opencode-go/Claude-Haiku-5-5"), OPENCODE_MESSAGES);
    assert.equal(opencodeProtocolOf("opencode/grok-4.7"), OPENCODE_RESPONSES);
  });
});

describe("opencodeModelName", () => {
  it("drops the provider the console writes in front", () => {
    assert.equal(opencodeModelName("opencode-go/kimi-k3"), "kimi-k3");
    assert.equal(opencodeModelName("opencode/kimi-k3"), "kimi-k3");
  });

  it("leaves a bare name as it is", () => {
    assert.equal(opencodeModelName("kimi-k3"), "kimi-k3");
  });
});
