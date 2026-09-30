import { useEffect, useState } from "react";
import { searchRuns } from "../../api";
import type { RunSearchState } from "../../interfaces";

/** One word searched through the whole record, asked again on every letter; an answer for an older word is dropped. */
export function useRunSearch(directory: string, query: string, written: number): RunSearchState {
  const [state, setState] = useState<RunSearchState>({
    hits: [],
    found: "",
  });

  useEffect(() => {
    // An empty field is no search: the list stands whole.
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
