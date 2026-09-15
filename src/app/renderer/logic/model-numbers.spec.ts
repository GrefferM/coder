import { describe, expect, it } from "vitest";
import { isModelFilled, modelNumbers } from "./model-numbers";
import { MODEL_FIELD_CONTEXT_CEILING } from "../constants";
import type { ProjectModel } from "../interfaces";
import { aModel } from "../testing";

function model(patch: Partial<ProjectModel> = {}): ProjectModel {
  return aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200_000,
    ...patch,
  });
}

describe("modelNumbers", () => {
  it("lists every number a model must carry, in the order its own form asks for them", () => {
    expect(modelNumbers(model()).map(([, field]) => field)).toEqual([
      "СТЕЛЯ КОНТЕКСТУ",
      "СТЕЛЯ ВІДПОВІДІ",
      "ВХІДНА ЦІНА",
      "ВИХІДНА ЦІНА",
    ]);
    expect(modelNumbers(model())[0]).toEqual([200_000, MODEL_FIELD_CONTEXT_CEILING]);
  });
});

describe("isFilled", () => {
  it("takes a model whose every number is written", () => {
    expect(isModelFilled(model())).toBe(true);
  });

  it("takes a price of nothing as written, since a local model costs nothing and is whole", () => {
    expect(
      isModelFilled(
        model({
          inputPrice: 0,
          outputPrice: 0,
        }),
      ),
    ).toBe(true);
  });

  it("refuses a model missing a price, not only one missing a ceiling", () => {
    expect(
      isModelFilled(
        model({
          outputPrice: null,
        }),
      ),
    ).toBe(false);
    expect(
      isModelFilled(
        model({
          contextCeiling: null,
        }),
      ),
    ).toBe(false);
  });
});
