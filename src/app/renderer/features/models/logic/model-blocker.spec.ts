import { describe, expect, it } from "vitest";
import { modelBlocker } from "./model-blocker";
import type { ModelFormValues } from "../interfaces";
import {
  MODEL_ANSWER_CEILING_DROPPED_LABEL,
  MODEL_CONTEXT_CEILING_DROPPED_LABEL,
  MODEL_OUTPUT_PRICE_DROPPED_LABEL,
  MODEL_PROVIDER_DROPPED_LABEL,
} from "../constants";

const FILLED: ModelFormValues = {
  title: "claude-sonnet-4-5",
  kind: "text",
  provider: "anthropic",
  contextCeiling: "200000",
  answerCeiling: "4096",
  inputPrice: "3",
  outputPrice: "15",
};

describe("modelBlocker", () => {
  it("stops nothing when the model has a name, a provider, both ceilings and both prices", () => {
    expect(modelBlocker(FILLED)).toEqual([]);
  });

  it("names a price nobody wrote", () => {
    expect(
      modelBlocker({
        ...FILLED,
        outputPrice: "",
      }),
    ).toEqual([MODEL_OUTPUT_PRICE_DROPPED_LABEL]);
  });

  it("names both ceilings when neither is written", () => {
    // A model is saved only once both numbers are written.
    expect(
      modelBlocker({
        ...FILLED,
        contextCeiling: "",
        answerCeiling: "",
      }),
    ).toEqual([MODEL_CONTEXT_CEILING_DROPPED_LABEL, MODEL_ANSWER_CEILING_DROPPED_LABEL]);
  });

  it("names the answer's ceiling alone when only it is missing", () => {
    expect(
      modelBlocker({
        ...FILLED,
        answerCeiling: "",
      }),
    ).toEqual([MODEL_ANSWER_CEILING_DROPPED_LABEL]);
  });

  it("names a provider nobody chose", () => {
    expect(
      modelBlocker({
        ...FILLED,
        provider: "",
      }),
    ).toEqual([MODEL_PROVIDER_DROPPED_LABEL]);
  });

  it("asks a recognition model for its name and provider only", () => {
    expect(
      modelBlocker({
        ...FILLED,
        kind: "listen",
        contextCeiling: "",
        inputPrice: "",
      }),
    ).toEqual([]);
  });
});
