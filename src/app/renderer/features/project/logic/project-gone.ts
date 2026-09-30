import type { ProjectEntry } from "../../../interfaces";

/** The list with a folder that no longer holds a project marked gone; other rows unchanged. */
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
