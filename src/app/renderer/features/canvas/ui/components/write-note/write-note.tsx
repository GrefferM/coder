import { useEffect, useRef, useState } from "react";
import { TextButton } from "../../../../../components";
import { CanvasPill } from "../canvas-pill";
import { INTERACTION_HOVER_TEXT_COLOR } from "../../../../../constants";
import {
  WRITE_NOTE_DONE_COLOR,
  WRITE_NOTE_DETAIL_COLOR,
  WRITE_NOTE_DONE_TEXT_COLOR,
  WRITE_NOTE_FAILED_COLOR,
  WRITE_NOTE_GAP_PX,
  WRITE_NOTE_ICON_SIZE_PX,
  WRITE_NOTE_MS,
  WRITE_NOTE_OUT_MS,
  WRITE_NOTE_RETRY_COLOR,
  WRITE_NOTE_RETRY_LABEL,
} from "./constants";
import type { WriteNoteProps } from "./interfaces";

/** Write result line. Done: green check, auto-dismisses. Failed: reason and retry, stays until answered. */
export function WriteNote({ note, onRetry, onDismiss }: WriteNoteProps) {
  const isDone = note.reason === null;
  const [isLeaving, setIsLeaving] = useState(false);
  /**
   * The note is what the timer stands on, never the hand that takes it away. A caller passing an inline arrow
   * would hand a fresh hand on every render of the page above, and the two timers would restart under it for as
   * long as the page kept rendering — a note that never leaves. Held in a ref, as the window's own dismiss is.
   */
  const dismiss = useRef(onDismiss);

  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!isDone) {
      return;
    }

    const standing = window.setTimeout(() => setIsLeaving(true), WRITE_NOTE_MS);
    const going = window.setTimeout(() => dismiss.current(), WRITE_NOTE_MS + WRITE_NOTE_OUT_MS);

    return () => {
      window.clearTimeout(standing);
      window.clearTimeout(going);
    };
    // A new note restarts the timer.
  }, [isDone, note]);

  return (
    <CanvasPill gapPx={WRITE_NOTE_GAP_PX} tone={isDone ? "done" : "failed"} isLeaving={isLeaving}>
      {isDone ? (
        <svg
          width={WRITE_NOTE_ICON_SIZE_PX}
          height={WRITE_NOTE_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={WRITE_NOTE_DONE_COLOR}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 13 4 4L19 7" />
        </svg>
      ) : (
        <svg
          width={WRITE_NOTE_ICON_SIZE_PX}
          height={WRITE_NOTE_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={WRITE_NOTE_FAILED_COLOR}
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5h.01" />
        </svg>
      )}
      <span
        style={{
          color: isDone ? WRITE_NOTE_DONE_TEXT_COLOR : WRITE_NOTE_FAILED_COLOR,
        }}
      >
        {isDone ? note.label : note.reason}
      </span>
      {note.detail !== null && (
        <span
          style={{
            color: WRITE_NOTE_DETAIL_COLOR,
          }}
        >
          {note.detail}
        </span>
      )}
      {!isDone && (
        <TextButton
          tone={{
            rest: WRITE_NOTE_RETRY_COLOR,
            lit: INTERACTION_HOVER_TEXT_COLOR,
          }}
          onPress={onRetry}
        >
          {WRITE_NOTE_RETRY_LABEL}
        </TextButton>
      )}
    </CanvasPill>
  );
}
