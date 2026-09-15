import { describe, expect, it } from "vitest";
import { commandFormValues } from "./command-form-values";
import { EMPTY_COMMAND_FORM_VALUES } from "../constants";
import type { CommandParameter } from "../../../interfaces";

describe("commandFormValues", () => {
  it("takes everything a declared command holds, its parameters among them", () => {
    const parameters: CommandParameter[] = [
      {
        id: "parameter-1",
        name: "mask",
        type: "text",
        description: "Яких файлів шукати",
        isRequired: false,
        values: [],
      },
    ];

    expect(
      commandFormValues({
        id: "command-1",
        name: "find_deep",
        description: "Шукає в теці",
        run: "rg --files",
        parameters,
      }),
    ).toEqual({
      name: "find_deep",
      description: "Шукає в теці",
      run: "rg --files",
      parameters,
    });
  });

  it("opens a command that does not exist yet on the empty form", () => {
    expect(commandFormValues(null)).toBe(EMPTY_COMMAND_FORM_VALUES);
  });
});
