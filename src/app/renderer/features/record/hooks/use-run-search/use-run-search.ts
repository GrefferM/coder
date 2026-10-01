import { useEffect, useState } from "react";
import { searchRuns } from "../../api";
import { RECORD_UNREAD_NOTE } from "../../constants";
import { recordNote } from "../../words";
import { thrownWords } from "../../../../utils/errors";
import type { RunSearchState } from "../../interfaces";

/** One word searched through the whole record, asked again on every letter; an answer for an older word is dropped. */
export function useRunSearch(directory: string, query: string, written: number): RunSearchState {
  const [state, setState] = useState<RunSearchState>({
    hits: [],
    found: "",
    refusal: null,
  });

  useEffect(() => {
    // An empty field is no search: the list stands whole.
    if (query.trim() === "") {
      setState({
        hits: [],
        found: "",
        refusal: null,
      });

      return;
    }

    let stands = true;

    void searchRuns(directory, query).then(
      (hits) => {
        if (stands) {
          setState({
            hits,
            found: query,
            refusal: null,
          });
        }
      },
      (failure: unknown) => {
        if (stands) {
          setState({
            hits: [],
            found: query,
            refusal: recordNote(RECORD_UNREAD_NOTE, thrownWords(failure)),
          });
        }
      },
    );

    return () => {
      stands = false;
    };
  }, [directory, query, written]);

  return state;
}
