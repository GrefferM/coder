import { describe, expect, it } from "vitest";
import { nameTaken } from "./name-taken";

describe("nameTaken", () => {
  it("finds a name another command already carries", () => {
    expect(nameTaken("read_file", ["list_files", "read_file"])).toBe(true);
  });

  it("reads a name with spaces around it as the name inside them", () => {
    expect(nameTaken("  read_file ", ["read_file"])).toBe(true);
  });

  it("lets a name nobody has through", () => {
    expect(nameTaken("write_note", ["list_files", "read_file"])).toBe(false);
  });

  it("says nothing about an empty name, which is a field to fill rather than a name that is taken", () => {
    expect(nameTaken("   ", ["read_file"])).toBe(false);
  });

  it("reads a name written in another case as the same name", () => {
    // The canvas writes every label in capitals, so «Тезар» and «ТЕЗАР» are one picture on screen.
    expect(nameTaken("Тезар", ["ТЕЗАР"])).toBe(true);
    expect(nameTaken("READ_FILE", ["read_file"])).toBe(true);
  });
});
