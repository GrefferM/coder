import { describe, expect, it } from "vitest";
import { modelFromForm } from "./model-from-form";
import type { ModelFormValues } from "../interfaces";

const FILLED: ModelFormValues = {
  title: "claude-sonnet-4.5",
  kind: "text",
  provider: "anthropic",
  contextCeiling: "700000",
  answerCeiling: "16000",
  inputPrice: "3",
  outputPrice: "15",
};

describe("modelFromForm", () => {
  it("writes a text model with its numbers", () => {
    expect(modelFromForm(FILLED)).toEqual({
      title: "claude-sonnet-4.5",
      kind: "text",
      provider: "anthropic",
      contextCeiling: 700_000,
      answerCeiling: 16_000,
      inputPrice: 3,
      outputPrice: 15,
    });
  });

  it("writes a recognition model with no numbers, whatever the hidden fields still hold", () => {
    expect(
      modelFromForm({
        ...FILLED,
        title: "openai/whisper-large-v3",
        kind: "listen",
        provider: "openrouter",
      }),
    ).toEqual({
      title: "openai/whisper-large-v3",
      kind: "listen",
      provider: "openrouter",
      contextCeiling: null,
      answerCeiling: null,
      inputPrice: null,
      outputPrice: null,
    });
  });
});
