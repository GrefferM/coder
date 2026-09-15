import { useEffect, useState } from "react";
import { TextAction } from "../text-action";
import { COPY_ACTION_LABEL, COPY_ACTION_TAKEN_LABEL, COPY_ACTION_TAKEN_MS } from "./constants";
import type { CopyActionProps } from "./interfaces";

/**
 * «копіюємо відповідь і мовчимо» — a text taken away whole, and nothing done to it and nothing
 * suggested about it. The word swaps for a moment after the press, because an action that answers nothing is
 * pressed again.
 */
export function CopyAction({ text }: CopyActionProps) {
  const [isTaken, setIsTaken] = useState(false);

  useEffect(() => {
    if (!isTaken) {
      return;
    }

    const said = setTimeout(() => setIsTaken(false), COPY_ACTION_TAKEN_MS);

    return () => clearTimeout(said);
  }, [isTaken]);

  return (
    <TextAction
      label={isTaken ? COPY_ACTION_TAKEN_LABEL : COPY_ACTION_LABEL}
      onClick={() => {
        void navigator.clipboard
          ?.writeText(text)
          .then(() => setIsTaken(true))
          // A clipboard the machine refuses is not this row's business: the word stands as it was, and the
          // refusal is caught here rather than thrown at the app, which would take a turn down with it.
          .catch(() => setIsTaken(false));
      }}
    />
  );
}
