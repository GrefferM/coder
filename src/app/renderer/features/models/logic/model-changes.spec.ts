import { describe, expect, it } from "vitest";
import { modelChanges } from "./model-changes";
import { modelFormValues } from "./model-form-values";
import { MODEL_TITLE_CHANGE_LABEL, MODEL_TITLE_DROPPED_LABEL } from "../constants";
import { aModel } from "../../../testing";

const SAVED = modelFormValues(
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
);

describe("modelChanges", () => {
  it("says nothing moved while the form still holds what is saved", () => {
    expect(modelChanges(SAVED, SAVED)).toEqual([]);
  });

  it("names only the field that moved, and both its sides", () => {
    expect(
      modelChanges(SAVED, {
        ...SAVED,
        title: "claude-opus-4.1",
      }),
    ).toEqual([
      {
        label: MODEL_TITLE_CHANGE_LABEL,
        droppedLabel: MODEL_TITLE_DROPPED_LABEL,
        was: "claude-sonnet-4.5",
        now: "claude-opus-4.1",
      },
    ]);
  });

  it("counts every field of a model being written from scratch as moved", () => {
    // All six fields differ for an empty form; neither ceiling opens on a number.
    expect(modelChanges(modelFormValues(null), SAVED)).toHaveLength(6);
  });
});
