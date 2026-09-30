import { describe, expect, it } from "vitest";
import { modelFormValues } from "./model-form-values";
import { EMPTY_MODEL_FORM_VALUES } from "../constants";
import { aModel } from "../../../testing";

describe("modelFormValues", () => {
  it("says every number of the record in the letters a field holds", () => {
    // Form fields carry text, so the ceiling and both prices pass through as written.
    expect(
      modelFormValues(
        aModel({
          title: "hy-mt2",
          provider: "tencent",
        }),
      ),
    ).toEqual({
      title: "hy-mt2",
      provider: "tencent",
      contextCeiling: "700000",
      answerCeiling: "4096",
      inputPrice: "3",
      outputPrice: "15",
    });
  });

  it("opens a model that does not exist yet on the empty form, ceiling and all", () => {
    // The empty form opens with a ceiling most models hold.
    expect(modelFormValues(null)).toBe(EMPTY_MODEL_FORM_VALUES);
  });
});
