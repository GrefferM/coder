import { describe, expect, it } from "vitest";
import { brokenPlaceNote } from "./broken-place-note";
import type { BrokenPlace } from "../../../interfaces";

function place(patch: Partial<BrokenPlace> = {}): BrokenPlace {
  return {
    trail: [
      {
        kind: "command",
        name: "run_tests",
      },
    ],
    field: "id",
    rule: "isUuid",
    ...patch,
  };
}

describe("brokenPlaceNote", () => {
  it("names the thing, its field and what is wrong, in words", () => {
    expect(brokenPlaceNote(place())).toBe(
      "Команда «run_tests»: поле «ідентифікатор» — має бути коректним ідентифікатором",
    );
  });

  it("names every step on the way down, the innermost thing last", () => {
    expect(
      brokenPlaceNote(
        place({
          trail: [
            {
              kind: "command",
              name: "fetch",
            },
            {
              kind: "parameter",
              name: "url",
            },
          ],
        }),
      ),
    ).toBe("Команда «fetch» → параметр «url»: поле «ідентифікатор» — має бути коректним ідентифікатором");
  });

  it("says «Проєкт» where the field is the project's own, with no thing to name", () => {
    expect(
      brokenPlaceNote({
        trail: [],
        field: "name",
        rule: "isNotEmpty",
      }),
    ).toBe("Проєкт: поле «імʼя» — не заповнено");
  });

  it("names a thing that has no name of its own by its kind alone", () => {
    expect(
      brokenPlaceNote(
        place({
          trail: [
            {
              kind: "link",
              name: null,
            },
          ],
          field: "fromId",
        }),
      ),
    ).toBe("Звʼязок: поле «fromId» — має бути коректним ідентифікатором");
  });

  it("says a field and a rule it has no word for by their plain key", () => {
    expect(
      brokenPlaceNote(
        place({
          field: "somethingNew",
          rule: "isWhatever",
        }),
      ),
    ).toBe("Команда «run_tests»: поле «somethingNew» — некоректне значення");
  });
});
