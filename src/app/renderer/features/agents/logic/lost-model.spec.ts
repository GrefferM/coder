import { describe, expect, it } from "vitest";
import { isModelLost } from "./lost-model";
import type { ProjectModel } from "../../../interfaces";
import { aModel } from "../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
];

describe("isModelLost", () => {
  it("says nothing is broken where the model is held", () => {
    expect(isModelLost("model-1", MODELS)).toBe(false);
  });

  it("says the tie is broken where the project no longer holds that model", () => {
    expect(isModelLost("model-2", MODELS)).toBe(true);
  });

  it("takes an agent with nothing chosen yet for a choice not made, not a loss", () => {
    expect(isModelLost("", MODELS)).toBe(false);
  });
});
