import { describe, expect, it } from "vitest";
import { withProjectGone } from "./project-gone";
import type { ProjectEntry } from "../../../interfaces";

function entry(directory: string): ProjectEntry {
  return {
    id: directory,
    name: directory,
    directory,
    openedAt: "2026-08-13T00:00:00.000Z",
    exists: true,
    agentCount: 2,
  };
}

const ENTRIES = [entry("/code/coder-app"), entry("/work/docs-pipeline")];

describe("withProjectGone", () => {
  it("marks the row whose folder has gone and leaves every other one standing", () => {
    const marked = withProjectGone(ENTRIES, "/work/docs-pipeline");

    expect(marked.map((one) => one.exists)).toEqual([true, false]);
    expect(marked[0]).toBe(ENTRIES[0]);
  });

  it("leaves the whole list as it stands when no row names that folder", () => {
    const marked = withProjectGone(ENTRIES, "/work/gone");

    expect(marked).toEqual(ENTRIES);
  });

  it("marks a row without touching the list it was given", () => {
    withProjectGone(ENTRIES, "/work/docs-pipeline");

    expect(ENTRIES.every((one) => one.exists)).toBe(true);
  });
});
