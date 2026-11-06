import { describe, expect, it } from "vitest";
import { priceLabel } from "./price-label";
import type { ProjectModel } from "../interfaces";

function model(fields: Partial<ProjectModel> = {}): ProjectModel {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "opus",
    kind: "text",
    provider: "22222222-2222-4222-8222-222222222222",
    contextCeiling: 200000,
    answerCeiling: 8192,
    inputPrice: 15,
    outputPrice: 75,
    ...fields,
  };
}

describe("priceLabel · what a model costs, in words", () => {
  it("says both prices and what they buy", () => {
    expect(priceLabel(model())).toBe("$15.00 · $75.00 / 1M");
  });

  it("says the same for the catalogue row and the picker row, since it is one word", () => {
    expect(
      priceLabel(
        model({
          inputPrice: 0.5,
          outputPrice: 1.25,
        }),
      ),
    ).toBe("$0.50 · $1.25 / 1M");
  });

  it("names the field nobody wrote instead of a price", () => {
    expect(
      priceLabel(
        model({
          contextCeiling: null,
        }),
      ),
    ).toBe("НЕ ЗАПОВНЕНО · СТЕЛЯ КОНТЕКСТУ");
  });

  it("names the first field missing when more than one is, in the order the form asks for them", () => {
    expect(
      priceLabel(
        model({
          answerCeiling: null,
          outputPrice: null,
        }),
      ),
    ).toBe("НЕ ЗАПОВНЕНО · СТЕЛЯ ВІДПОВІДІ");
  });
});
