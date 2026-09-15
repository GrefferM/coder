import { describe, expect, it } from "vitest";
import { missingFieldsNote } from "./missing-fields-note";

describe("missingFieldsNote", () => {
  it("names one empty field", () => {
    expect(missingFieldsNote(["опис"])).toBe("Це не записати: не заповнено опис.");
  });

  it("names two the way Ukrainian names a pair", () => {
    expect(missingFieldsNote(["ім'я", "опис"])).toBe("Це не записати: не заповнено ім'я й опис.");
  });
});
