import { useEffect, useState } from "react";
import { TextAction } from "../text-action";
import { COPY_ACTION_LABEL, COPY_ACTION_TAKEN_LABEL, COPY_ACTION_TAKEN_MS } from "./constants";
import type { CopyActionProps } from "./interfaces";

/** Copies a text whole, silently; the label swaps briefly after the press. */
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
          // A refused clipboard write leaves the label as it was and is caught here.
          .catch(() => setIsTaken(false));
      }}
    />
  );
}
