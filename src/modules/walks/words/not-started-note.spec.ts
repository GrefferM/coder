import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  noAddressNote,
  noKeyNote,
  notFilledAgentNote,
  notFilledNote,
  notStartedNote,
  noProviderNote,
} from "./not-started-note";
import { AGENT_FIELD_TEMPERATURE, CHAT_PROVIDER_SILENT_NOTE, MODEL_FIELD_ANSWER_CEILING } from "../../../contracts";
import { aModel } from "../../../utils/testing";
import type { ProviderState } from "../../../contracts";

describe("not-started notes", () => {
  it("names the model and the provider the key is missing for", () => {
    assert.equal(
      noKeyNote("claude-haiku-4.5", "Anthropic"),
      "Модель claude-haiku-4.5 належить провайдеру Anthropic, а ключа до нього немає.",
    );
  });

  it("names the provider a model asks for and nobody declared", () => {
    assert.equal(noProviderNote("ollama-old"), "Модель називає провайдера ollama-old, якого немає.");
  });

  it("names the provider whose address is empty, whoever runs it", () => {
    // RunPod is someone else's machine, but its address is still the person's to write.
    assert.equal(noAddressNote("ollama"), "У провайдера ollama порожнє поле адреси — стукати нікуди.");
    assert.equal(noAddressNote("RunPod"), "У провайдера RunPod порожнє поле адреси — стукати нікуди.");
  });

  it("names the model's empty field in plain speech, since the caps belong to the pill and not to the name", () => {
    assert.equal(
      notFilledNote("claude-sonnet-4.5", MODEL_FIELD_ANSWER_CEILING),
      "У моделі claude-sonnet-4.5 не заповнено поле «Стеля відповіді». Заповніть його, і агент піде.",
    );
  });

  it("names the agent, not the model, where the empty field is the agent's own", () => {
    assert.equal(
      notFilledAgentNote("ТЕЗАР", AGENT_FIELD_TEMPERATURE),
      "В агента ТЕЗАР не заповнено поле «Температура». Заповніть його, і агент піде.",
    );
  });
});

describe("notStartedNote", () => {
  const model = aModel({
    title: "hy-mt2",
    provider: "tencent",
  });
  const provider = {
    id: "tencent",
    name: "Tencent",
  } as unknown as ProviderState;

  it("names the model and the provider where the key is what is missing", () => {
    assert.equal(notStartedNote("noKey", model, provider), noKeyNote("hy-mt2", "Tencent"));
  });

  it("names the provider a model points at and nobody declared", () => {
    assert.equal(notStartedNote("noProvider", model, null), noProviderNote("tencent"));
  });

  it("falls back to what the model says where the provider is not there to be named", () => {
    // Without a declared provider the model's own word is used.
    assert.equal(notStartedNote("noKey", model, null), noKeyNote("hy-mt2", "tencent"));
    assert.equal(notStartedNote("noAddress", model, null), noAddressNote("tencent"));
  });

  it("says the sentence about the machine where the provider is declared but silent", () => {
    // A silent provider has nothing to name.
    assert.equal(notStartedNote("silent", model, provider), CHAT_PROVIDER_SILENT_NOTE);
  });
});
