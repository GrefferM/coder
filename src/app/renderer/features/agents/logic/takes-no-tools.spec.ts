import { describe, expect, it } from "vitest";
import { takesNoTools } from "./takes-no-tools";
import { aModel } from "../../../testing";
import type { ProviderState } from "../../../interfaces";

const MODELS = [
  aModel({
    id: "model-1",
    title: "dphn/dolphin3.0-llama3.1-8b",
    provider: "runpod",
  }),
  aModel({
    id: "model-2",
    title: "claude-sonnet-4.5",
    provider: "anthropic",
  }),
];

function aProvider(patch: Partial<ProviderState> = {}): ProviderState {
  return {
    id: "runpod",
    name: "RunPod",
    kind: "remote",
    needs: ["key", "address"],
    takesTools: false,
    customaryAddress: null,
    keyHint: null,
    address: null,
    isOff: false,
    ...patch,
  };
}

const PROVIDERS = [
  aProvider(),
  aProvider({
    id: "anthropic",
    name: "Anthropic",
    needs: ["key"],
    takesTools: true,
    isOff: false,
  }),
];

describe("takesNoTools", () => {
  it("says so of a model whose provider carries no function calls", () => {
    expect(takesNoTools("model-1", MODELS, PROVIDERS)).toBe(true);
  });

  it("says nothing of a provider that carries them", () => {
    expect(takesNoTools("model-2", MODELS, PROVIDERS)).toBe(false);
  });

  it("says nothing where the model is not in the project: that is its own trouble, with its own word", () => {
    expect(takesNoTools("model-gone", MODELS, PROVIDERS)).toBe(false);
  });

  it("says nothing where nobody declared the provider under the model, for the same reason", () => {
    expect(takesNoTools("model-1", MODELS, [PROVIDERS[1]])).toBe(false);
  });
});
