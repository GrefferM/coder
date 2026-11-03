import { describe, expect, it } from "vitest";
import { stepMoneyWord } from "./step-money-word";
import { STEP_MONEY_FREE_LABEL } from "../constants";
import { RUN_STEP_TOO_LONG } from "../../record";
import { UNKNOWN_NUMBER } from "../../../utils/numbers/constants";
import { aStep } from "../../../testing";

describe("stepMoneyWord", () => {
  it("writes what the turn cost at the prices its model carried then", () => {
    expect(
      stepMoneyWord(
        aStep({
          money: 0.09,
        }),
      ),
    ).toBe("$0.09");
  });

  it("says «локально» for a price somebody wrote as nothing, since that is a cost and not a silence", () => {
    // «ЛОКАЛЬНО» is a known zero price; the dash is an unwritten price.
    expect(
      stepMoneyWord(
        aStep({
          inputPrice: 0,
          outputPrice: 0,
          money: 0,
        }),
      ),
    ).toBe(STEP_MONEY_FREE_LABEL);
  });

  it("stands a dash where a price was never written, and does not read that as nothing", () => {
    expect(
      stepMoneyWord(
        aStep({
          inputPrice: null,
          outputPrice: null,
          money: null,
        }),
      ),
    ).toBe(UNKNOWN_NUMBER);
  });

  it("stands a dash where only one of the two prices is missing, since neither half counts alone", () => {
    expect(
      stepMoneyWord(
        aStep({
          outputPrice: null,
          money: null,
        }),
      ),
    ).toBe(UNKNOWN_NUMBER);
  });

  it("writes a true nought for a turn that never went out, whatever its prices were", () => {
    expect(
      stepMoneyWord(
        aStep({
          state: RUN_STEP_TOO_LONG,
          inputPrice: null,
          outputPrice: null,
          money: null,
        }),
      ),
    ).toBe("$0.00");
  });
});
