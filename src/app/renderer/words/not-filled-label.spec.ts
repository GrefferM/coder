import { describe, expect, it } from "vitest";
import { notFilledLabel } from "./not-filled-label";
import { modelNumbers } from "../logic";
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

describe("notFilledLabel", () => {
  it("says nothing where every number is written", () => {
    expect(notFilledLabel(modelNumbers(model()))).toBeNull();
  });

  it("names the empty field after the word, in one shape for the pill, the row and the picker", () => {
    expect(
      notFilledLabel(
        modelNumbers(
          model({
            answerCeiling: null,
          }),
        ),
      ),
    ).toBe("НЕ ЗАПОВНЕНО · СТЕЛЯ ВІДПОВІДІ");
  });

  it("names the first empty field in the order it was given, since that is the row the person meets", () => {
    expect(
      notFilledLabel(
        modelNumbers(
          model({
            contextCeiling: null,
            outputPrice: null,
          }),
        ),
      ),
    ).toBe("НЕ ЗАПОВНЕНО · СТЕЛЯ КОНТЕКСТУ");
  });
});
