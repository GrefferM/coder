import { describe, expect, it } from "vitest";
import { attachedName } from "./attached-name";

describe("attachedName", () => {
  it("names a folder with a trailing slash and a file as it is", () => {
    expect(attachedName("src", "folder")).toBe("src/");
    expect(attachedName("logout.log", "file")).toBe("logout.log");
  });

  it("names one whose kind could not be learnt as it is", () => {
    expect(attachedName("gone", null)).toBe("gone");
  });
});
