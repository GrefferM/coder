import { describe, expect, it } from "vitest";
import { stepUnknownWord } from "./step-unknown-word";
import { STEP_MONEY_NO_PRICES_LABEL, STEP_NOT_STARTED_LABEL } from "../constants";
import { RUN_STEP_TOO_LONG } from "../../record";
import { aStep } from "../../../testing";

describe("stepUnknownWord", () => {
  it("says nothing where every number of the step is known", () => {
    expect(stepUnknownWord(aStep())).toBeNull();
  });

  it("names the empty prices once, whichever of the two is missing", () => {
    // One line per head speaks for every dash, so one word covers either price.
    expect(
      stepUnknownWord(
        aStep({
          inputPrice: null,
          money: null,
        }),
      ),
    ).toBe(STEP_MONEY_NO_PRICES_LABEL);
    expect(
      stepUnknownWord(
        aStep({
          outputPrice: null,
          money: null,
        }),
      ),
    ).toBe(STEP_MONEY_NO_PRICES_LABEL);
  });

  it("says nothing for a model priced at nothing: that is a price, and «локально» already says it", () => {
    expect(
      stepUnknownWord(
        aStep({
          inputPrice: 0,
          outputPrice: 0,
          money: 0,
        }),
      ),
    ).toBeNull();
  });

  it("says the turn never began, and says that instead of the prices", () => {
    // The refusal explains the whole head; the empty-prices cause is not named over it.
    expect(
      stepUnknownWord(
        aStep({
          state: RUN_STEP_TOO_LONG,
          inputPrice: null,
          outputPrice: null,
          money: null,
        }),
      ),
    ).toBe(STEP_NOT_STARTED_LABEL);
  });
});
