import { describe, expect, it } from "vitest";
import { foundAddress } from "./found-address";
import { FOUND_STEP_PREFIX, RUN_HISTORY_SEPARATOR } from "../constants";

describe("foundAddress", () => {
  it("says the step of the walk and the hour, the way the message's own card says them", () => {
    expect(foundAddress(2, "14:12")).toBe(`${FOUND_STEP_PREFIX}2${RUN_HISTORY_SEPARATOR}14:12`);
  });

  it("says the hour alone where the message stands on no step — the person's own question", () => {
    expect(foundAddress(null, "14:12")).toBe("14:12");
  });
});
