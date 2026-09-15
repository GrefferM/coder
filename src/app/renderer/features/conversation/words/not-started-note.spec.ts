import { describe, expect, it } from "vitest";
import {
  noAddressNote,
  noKeyNote,
  notFilledAgentNote,
  notFilledNote,
  notStartedNote,
  noProviderNote,
} from "./not-started-note";
import { CHAT_PROVIDER_SILENT_NOTE } from "../constants";
import { AGENT_FIELD_TEMPERATURE, MODEL_FIELD_ANSWER_CEILING } from "../../../constants";
import type { ProviderState } from "../../../interfaces";
import { aModel } from "../../../testing";

describe("not-started notes", () => {
  it("names the model and the provider the key is missing for", () => {
    expect(noKeyNote("claude-haiku-4.5", "Anthropic")).toBe(
      "Модель claude-haiku-4.5 належить провайдеру Anthropic, а ключа до нього немає.",
    );
  });

  it("names the provider a model asks for and nobody declared", () => {
    expect(noProviderNote("ollama-old")).toBe("Модель називає провайдера ollama-old, якого немає.");
  });

  it("names the local provider whose address is empty", () => {
    expect(noAddressNote("ollama")).toBe("У локального провайдера ollama порожнє поле адреси — стукати нікуди.");
  });

  it("names the model's empty field in plain speech, since the caps belong to the pill and not to the name", () => {
    expect(notFilledNote("claude-sonnet-4.5", MODEL_FIELD_ANSWER_CEILING)).toBe(
      "У моделі claude-sonnet-4.5 не заповнено поле «Стеля відповіді». Заповніть його, і агент піде.",
    );
  });

  it("names the agent, not the model, where the empty field is the agent's own", () => {
    expect(notFilledAgentNote("ТЕЗАР", AGENT_FIELD_TEMPERATURE)).toBe(
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
    expect(notStartedNote("noKey", model, provider)).toBe(noKeyNote("hy-mt2", "Tencent"));
  });

  it("names the provider a model points at and nobody declared", () => {
    expect(notStartedNote("noProvider", model, null)).toBe(noProviderNote("tencent"));
  });

  it("falls back to what the model says where the provider is not there to be named", () => {
    // Without a declared provider there is no name to use, so the model's own word for it stands.
    expect(notStartedNote("noKey", model, null)).toBe(noKeyNote("hy-mt2", "tencent"));
    expect(notStartedNote("noAddress", model, null)).toBe(noAddressNote("tencent"));
  });

  it("says the sentence about the machine where the provider is declared but silent", () => {
    // A silent provider has nothing to name — it is the machine that is not answering.
    expect(notStartedNote("silent", model, provider)).toBe(CHAT_PROVIDER_SILENT_NOTE);
  });
});
