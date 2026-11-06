import { describe, expect, it } from "vitest";
import { heardIntoDraft } from "./heard-into-draft";

describe("heardIntoDraft", () => {
  it("writes the heard words after what is typed, one space between", () => {
    expect(heardIntoDraft("Подивись, чому падає вихід,", "логи й схема в додатку.")).toBe(
      "Подивись, чому падає вихід, логи й схема в додатку.",
    );
  });

  it("puts no space before the words where nothing is typed", () => {
    expect(heardIntoDraft("", "Прогони тести.")).toBe("Прогони тести.");
  });

  it("takes the trailing spaces and lines of the draft off before the words", () => {
    expect(heardIntoDraft("Перше речення.\n  ", "Друге.")).toBe("Перше речення. Друге.");
  });
});
