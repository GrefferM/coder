import { describe, expect, it } from "vitest";
import { modelInstalled } from "./model-installed";
import type { ProjectModel, ProviderAnswer, ProviderState } from "../../../interfaces";
import { aModel } from "../../../testing";

const OLLAMA: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
};

const ANTHROPIC: ProviderState = {
  id: "anthropic",
  name: "Anthropic",
  kind: "remote",
  customaryAddress: null,
  keyHint: "sk-ant-…4Kd",
  address: null,
};

const LOCAL_MODEL: ProjectModel = aModel({
  title: "qwen2.5-coder:0.5b",
  provider: "ollama",
  inputPrice: 0,
  outputPrice: 0,
  contextCeiling: 200000,
});

function answered(names: string[]): Record<string, ProviderAnswer> {
  return {
    ollama: {
      isAnswering: true,
      models: names.map((name) => ({
        name,
        sizeBytes: null,
      })),
      askedAt: new Date(2026, 7, 19, 14, 26),
    },
  };
}

describe("modelInstalled", () => {
  it("finds a declared model among what the provider says it holds", () => {
    expect(modelInstalled(LOCAL_MODEL, [OLLAMA], answered(["qwen2.5-coder:0.5b"]))).toBe(true);
  });

  it("says a declared model is gone once the machine no longer holds it", () => {
    expect(modelInstalled(LOCAL_MODEL, [OLLAMA], answered(["qwen2.5-coder:1.5b"]))).toBe(false);
  });

  it("says nothing where the provider has not answered: a silence is not an empty machine", () => {
    expect(modelInstalled(LOCAL_MODEL, [OLLAMA], {})).toBe(null);
    expect(
      modelInstalled(LOCAL_MODEL, [OLLAMA], {
        ollama: {
          isAnswering: false,
          models: [],
          askedAt: new Date(2026, 7, 19, 14, 26),
        },
      }),
    ).toBe(null);
  });

  it("says nothing about a remote provider, which is never asked what it holds", () => {
    expect(
      modelInstalled(
        {
          ...LOCAL_MODEL,
          provider: "anthropic",
        },
        [ANTHROPIC],
        {},
      ),
    ).toBe(null);
  });
});
