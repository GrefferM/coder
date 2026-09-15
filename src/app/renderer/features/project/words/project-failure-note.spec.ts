import { describe, expect, it } from "vitest";
import {
  PROJECT_FILE_BROKEN,
  PROJECT_FILE_BROKEN_NOTE,
  PROJECT_FILE_BROKEN_NOWHERE_NOTE,
  PROJECT_FROM_NEWER_BUILD,
  PROJECT_FROM_NEWER_BUILD_NOTE,
  REFUSAL_SAID_SEPARATOR,
} from "../constants";

import { projectFailureNote } from "./project-failure-note";

describe("projectFailureNote", () => {
  it("says in words that the file came from a newer build", () => {
    expect(projectFailureNote(new Error(`Error invoking remote method: ${PROJECT_FROM_NEWER_BUILD}`))).toBe(
      PROJECT_FROM_NEWER_BUILD_NOTE,
    );
  });

  it("hands anything else on as it came", () => {
    expect(projectFailureNote(new Error("ENOENT: no such file or directory"))).toBe(
      "ENOENT: no such file or directory",
    );
  });

  it("names a broken file in its own words, with the place the file goes wrong after them", () => {
    const said = projectFailureNote(
      new Error(`Error invoking remote method: ${PROJECT_FILE_BROKEN}${REFUSAL_SAID_SEPARATOR}agents[1].tools[7].id`),
    );

    expect(said).toBe(`${PROJECT_FILE_BROKEN_NOTE}agents[1].tools[7].id`);
  });

  it("does not leave the sentence hanging where the refusal named no place", () => {
    expect(projectFailureNote(new Error(`Error invoking remote method: ${PROJECT_FILE_BROKEN}`))).toBe(
      PROJECT_FILE_BROKEN_NOWHERE_NOTE,
    );
  });
});
