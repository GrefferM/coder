import { describe, expect, it } from "vitest";
import { packCeiling } from "./pack-ceiling";
import { aModel } from "../../../testing";

describe("packCeiling", () => {
  it("is the ceiling of the model the agent is asked with", () => {
    expect(
      packCeiling({
        model: aModel({
          contextCeiling: 128_000,
        }),
        provider: null,
        prompt: null,
      }),
    ).toBe(128_000);
  });

  it("reads nothing where no model can be asked — the turn meets its wall before the ceiling does", () => {
    expect(
      packCeiling({
        model: null,
        provider: null,
        prompt: null,
      }),
    ).toBe(0);
    expect(
      packCeiling({
        model: aModel({
          contextCeiling: null,
        }),
        provider: null,
        prompt: null,
      }),
    ).toBe(0);
  });
});
