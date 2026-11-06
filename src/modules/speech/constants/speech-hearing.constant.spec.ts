import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HEARING_WAYS } from "./speech-hearing.constant";
import { SPEECH_LISTEN_PROVIDER_IDS } from "../interfaces";

describe("HEARING_WAYS", () => {
  it("knows the way to every provider offered for hearing, and to no other", () => {
    assert.deepEqual(Object.keys(HEARING_WAYS).sort(), [...SPEECH_LISTEN_PROVIDER_IDS].sort());
  });

  it("reaches OpenRouter at its own address, under the OpenAI protocol", () => {
    assert.deepEqual(HEARING_WAYS.openrouter, {
      address: "https://openrouter.ai/api",
      protocolPath: "/v1",
    });
  });
});
