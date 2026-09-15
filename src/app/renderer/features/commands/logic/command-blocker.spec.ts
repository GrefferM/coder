import { describe, expect, it } from "vitest";
import { commandBlocker } from "./command-blocker";
import { COMMAND_DESCRIPTION_DROPPED_LABEL, COMMAND_NAME_DROPPED_LABEL } from "../constants";

const FILLED = {
  name: "Прогнати тести",
  description: "Проганяє тести пакета",
  run: "npm test",
  parameters: [],
};

describe("commandBlocker", () => {
  it("stops nothing when every field a command needs is filled", () => {
    expect(commandBlocker(FILLED)).toEqual([]);
  });

  it("names the field that is missing, and only it", () => {
    expect(
      commandBlocker({
        ...FILLED,
        description: "   ",
      }),
    ).toEqual([COMMAND_DESCRIPTION_DROPPED_LABEL]);
  });

  it("names them in the order the form asks for them", () => {
    expect(
      commandBlocker({
        ...FILLED,
        name: "",
        description: "",
      }),
    ).toEqual([COMMAND_NAME_DROPPED_LABEL, COMMAND_DESCRIPTION_DROPPED_LABEL]);
  });
});
