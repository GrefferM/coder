import { describe, expect, it } from "vitest";
import { changedFieldsSentence } from "./changed-fields-sentence";

describe("changedFieldsSentence", () => {
  it("says nothing when nothing moved", () => {
    expect(changedFieldsSentence([])).toBe("");
  });

  it("names one field, and capitalises the sentence it starts", () => {
    expect(changedFieldsSentence(["назву"])).toBe("Назву змінено й не збережено.");
  });

  it("joins two with й", () => {
    expect(changedFieldsSentence(["назву", "колір"])).toBe("Назву й колір змінено й не збережено.");
  });

  it("commas everyone before the last one", () => {
    expect(changedFieldsSentence(["назву", "модель", "колір"])).toBe("Назву, модель й колір змінено й не збережено.");
  });

  it("holds one wording for fields of any gender, which is why they stand as objects", () => {
    // «колір» is masculine and «назва» feminine; an agreeing verb would have to pick one of them.
    expect(changedFieldsSentence(["колір"])).toBe("Колір змінено й не збережено.");
  });
});
