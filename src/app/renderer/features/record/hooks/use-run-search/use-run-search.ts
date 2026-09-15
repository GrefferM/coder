import { useEffect, useState } from "react";
import { searchRuns } from "../../api";
import type { RunSearchState } from "../../interfaces";

/**
 * One word looked for through the whole record, asked again on every letter typed — the number over the
 * list and the list itself have to move with the hand, not with the Enter. An answer that comes back for a word the
 * person has already typed past is dropped: the list would otherwise flicker back to an older search.
 */
export function useRunSearch(directory: string, query: string, written: number): RunSearchState {
  const [state, setState] = useState<RunSearchState>({
    hits: [],
    found: "",
  });

  useEffect(() => {
    // An empty field is no search at all — the list stands whole and nobody is asking anything.
    if (query.trim() === "") {
      setState({
        hits: [],
        found: "",
      });

      return;
    }

    let stands = true;

    void searchRuns(directory, query).then((hits) => {
      if (stands) {
        setState({
          hits,
          found: query,
        });
      }
    });

    return () => {
      stands = false;
    };
  }, [directory, query, written]);

  return state;
}
