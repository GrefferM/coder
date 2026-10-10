import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isModelFilled, modelNumbers } from "./model-numbers";
import { MODEL_FIELD_CONTEXT_CEILING } from "./field-names.constant";
import { aModel } from "../testing";
import type { ProjectModel } from "./project-model.interface";

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
    assert.deepEqual(
      modelNumbers(model()).map(([, field]) => field),
      ["СТЕЛЯ КОНТЕКСТУ", "СТЕЛЯ ВІДПОВІДІ", "ВХІДНА ЦІНА", "ВИХІДНА ЦІНА"],
    );
    assert.deepEqual(modelNumbers(model())[0], [200_000, MODEL_FIELD_CONTEXT_CEILING]);
  });
});

describe("isFilled", () => {
  it("takes a model whose every number is written", () => {
    assert.equal(isModelFilled(model()), true);
  });

  it("takes a price of nothing as written, since a local model costs nothing and is whole", () => {
    assert.equal(
      isModelFilled(
        model({
          inputPrice: 0,
          outputPrice: 0,
        }),
      ),
      true,
    );
  });

  it("refuses a model missing a price, not only one missing a ceiling", () => {
    assert.equal(
      isModelFilled(
        model({
          outputPrice: null,
        }),
      ),
      false,
    );
    assert.equal(
      isModelFilled(
        model({
          contextCeiling: null,
        }),
      ),
      false,
    );
  });
});
