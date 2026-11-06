import { describe, expect, it } from "vitest";
import { kindLockNote } from "./kind-lock-note";

describe("kindLockNote", () => {
  it("says how many agents stand on the model", () => {
    expect(kindLockNote(2, false)).toBe("На ній стоять 2 агенти — вид не змінити, поки вони на ній.");
  });

  it("says speech hears with the model", () => {
    expect(kindLockNote(0, true)).toBe("Нею розпізнає «Мовлення» — вид не змінити, поки її там обрано.");
  });

  it("says nothing where the kind is free", () => {
    expect(kindLockNote(0, false)).toBeNull();
  });
});
