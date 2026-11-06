import { describe, expect, it } from "vitest";
import { mendedField } from "./mended-field";
import type { ModelFormValues } from "../interfaces";

function values(patch: Partial<ModelFormValues> = {}): ModelFormValues {
  return {
    title: "claude-sonnet-4.5",
    kind: "text",
    provider: "anthropic",
    contextCeiling: "200000",
    answerCeiling: "4096",
    inputPrice: "3",
    outputPrice: "15",
    ...patch,
  };
}

describe("mendedField", () => {
  it("says nothing of a form whose every number is written", () => {
    expect(mendedField(values())).toBeNull();
  });

  it("names the first empty number in the form's own order, which is the one the card named", () => {
    expect(
      mendedField(
        values({
          answerCeiling: "",
          inputPrice: "",
        }),
      ),
    ).toBe("answerCeiling");
  });

  it("counts a row of spaces as empty, since spaces are not a number either", () => {
    expect(
      mendedField(
        values({
          outputPrice: "   ",
        }),
      ),
    ).toBe("outputPrice");
  });
});
