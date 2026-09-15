import { describe, expect, it } from "vitest";
import { commandChanges } from "./command-changes";
import { COMMAND_PARAMETERS_CHANGE_LABEL, COMMAND_RUN_CHANGE_LABEL } from "../constants";

const SAVED = {
  name: "run_tests",
  description: "Прогнати тести проєкту й повернути звіт",
  run: "npm test",
  parameters: [],
};

describe("commandChanges", () => {
  it("says nothing moved while the form still holds what is saved", () => {
    expect(commandChanges(SAVED, SAVED)).toEqual([]);
  });

  it("names the field that moved and both its sides", () => {
    const [change] = commandChanges(SAVED, {
      ...SAVED,
      run: "npm test -- {pattern}",
    });

    expect(change.label).toBe(COMMAND_RUN_CHANGE_LABEL);
    expect(change.now).toBe("npm test -- {pattern}");
  });

  it("counts the parameters rather than listing them, since a diff row holds a name", () => {
    const [change] = commandChanges(SAVED, {
      ...SAVED,
      parameters: [
        {
          id: "parameter-1",
          name: "pattern",
          type: "text" as const,
          description: "Маска файлів тестів",
          isRequired: false,
          values: [],
        },
      ],
    });

    expect(change.label).toBe(COMMAND_PARAMETERS_CHANGE_LABEL);
    expect(change.was).toBe("БЕЗ ПАРАМЕТРІВ");
    expect(change.now).toBe("1 ПАРАМЕТР");
  });
});
