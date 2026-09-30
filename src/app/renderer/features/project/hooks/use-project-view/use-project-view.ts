import { useCallback, useEffect, useRef } from "react";
import { rememberProjectView } from "../../api";
import { PROJECT_VIEW_SETTLE_MS } from "./constants";
import type { ProjectView } from "../../../../interfaces";

/** This machine's note of where it is looking in the open project, written once the view settles. */
export function useProjectView(directory: string): (view: ProjectView) => void {
  const settling = useRef<number | null>(null);
  const wanted = useRef<ProjectView | null>(null);

  const write = useCallback(() => {
    const view = wanted.current;

    if (view === null) {
      return;
    }

    wanted.current = null;
    // A failed note is swallowed; the view is a convenience, not the project.
    void rememberProjectView(directory, view).catch(() => undefined);
  }, [directory]);

  useEffect(
    () => () => {
      if (settling.current !== null) {
        window.clearTimeout(settling.current);
        settling.current = null;
      }

      // On unmount the note goes without waiting.
      write();
    },
    [write],
  );

  return useCallback(
    (view: ProjectView) => {
      wanted.current = view;

      if (settling.current !== null) {
        window.clearTimeout(settling.current);
      }

      settling.current = window.setTimeout(() => {
        settling.current = null;
        write();
      }, PROJECT_VIEW_SETTLE_MS);
    },
    [write],
  );
}
