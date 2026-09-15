import { describe, expect, it } from "vitest";
import { isFunctionNameWrong } from "./is-function-name-wrong";
import { COMMAND_NAME_MAX_LENGTH } from "../../../../../contracts";

describe("isFunctionNameWrong", () => {
  it("takes latin letters, digits and the underscore, in any order", () => {
    expect(isFunctionNameWrong("run_test")).toBe(false);
    expect(isFunctionNameWrong("_2")).toBe(false);
    expect(isFunctionNameWrong("RunTest")).toBe(false);
  });

  it("refuses what a provider would refuse, and keeps what was typed for the field to show", () => {
    // The rule is not ours — the providers refuse by the same one, so the field's edge is theirs.
    expect(isFunctionNameWrong("run_тест")).toBe(true);
    expect(isFunctionNameWrong("run test")).toBe(true);
    expect(isFunctionNameWrong("run-test")).toBe(true);
    expect(isFunctionNameWrong("pulls.create")).toBe(true);
  });

  it("refuses a name longer than the providers take", () => {
    expect(isFunctionNameWrong("a".repeat(COMMAND_NAME_MAX_LENGTH))).toBe(false);
    expect(isFunctionNameWrong("a".repeat(COMMAND_NAME_MAX_LENGTH + 1))).toBe(true);
  });

  it("does not call an empty field wrong, since nothing is typed there yet", () => {
    // An empty required field is answered at the press, and not while somebody is still thinking.
    expect(isFunctionNameWrong("")).toBe(false);
  });
});
