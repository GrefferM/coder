import type { ProjectEntry } from "../../../interfaces";

/** The list with the row for a folder that no longer holds a project marked gone; every other row stands. */
export function withProjectGone(entries: ProjectEntry[], directory: string): ProjectEntry[] {
  return entries.map((entry) =>
    entry.directory === directory
      ? {
          ...entry,
          exists: false,
        }
      : entry,
  );
}
