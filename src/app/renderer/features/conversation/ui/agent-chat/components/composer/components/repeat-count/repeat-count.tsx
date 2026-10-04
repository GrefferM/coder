import { useRef, useState } from "react";
import { useInteraction } from "../../../../../../../../hooks";
import { INTERACTION_HOVER_BACKGROUND_COLOR, INTERACTION_TRANSITION } from "../../../../../../../../constants";
import { focusRing } from "../../../../../../../../utils/focus";
import { repeatCount } from "../../../../../../logic";
import { REPEAT_LEAST } from "../../../../../../constants";
import {
  AGENT_CHAT_REPEAT_COLOR,
  AGENT_CHAT_REPEAT_FONT_SIZE_PX,
  AGENT_CHAT_REPEAT_LABEL,
  AGENT_CHAT_REPEAT_LIT_COLOR,
  AGENT_CHAT_REPEAT_MANY_COLOR,
  AGENT_CHAT_REPEAT_MARK,
  AGENT_CHAT_REPEAT_MIN_WIDTH_PX,
  AGENT_CHAT_REPEAT_PADDING,
  AGENT_CHAT_SEND_BACKGROUND_COLOR,
  AGENT_CHAT_SEND_BORDER_RADIUS_PX,
  AGENT_CHAT_SEND_SIZE_PX,
} from "../../../../constants";
import type { RepeatCountProps } from "./interfaces";

/** «x1»: a press opens the count to typing; Enter or leaving keeps it (1–999), Escape drops what was typed. */
export function RepeatCount({ repeats, repeating, isShut, onRepeats }: RepeatCountProps) {
  const press = useInteraction();
  /** What is being typed; `null` while the count only shows. */
  const [typed, setTyped] = useState<string | null>(null);
  /** Set once Enter or Escape closed the typing, so the blur of the leaving field changes nothing after. */
  const isSettled = useRef(false);
  const isLocked = isShut || repeating !== null;

  const box = {
    minWidth: AGENT_CHAT_REPEAT_MIN_WIDTH_PX,
    height: AGENT_CHAT_SEND_SIZE_PX,
    padding: AGENT_CHAT_REPEAT_PADDING,
    border: "none",
    borderRadius: AGENT_CHAT_SEND_BORDER_RADIUS_PX,
    fontSize: AGENT_CHAT_REPEAT_FONT_SIZE_PX,
    outline: "none",
    transition: INTERACTION_TRANSITION,
  };

  /** Keeps what was typed, held to the bounds, and closes the typing. */
  function keep(written: string) {
    if (!isSettled.current) {
      onRepeats(repeatCount(written, repeats));
    }

    close();
  }

  function close() {
    isSettled.current = true;
    setTyped(null);
  }

  function open() {
    isSettled.current = false;
    setTyped("");
  }

  if (typed !== null && !isLocked) {
    return (
      <input
        autoFocus
        inputMode="numeric"
        aria-label={AGENT_CHAT_REPEAT_LABEL}
        value={typed}
        // Opened empty over the count it had; leaving it empty keeps that count.
        placeholder={String(repeats)}
        // Only digits are taken; the bounds are kept on leaving.
        onChange={(event) => setTyped(event.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={(event) => keep(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            keep(event.currentTarget.value);
          }

          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
        className="font-monospace text-center flex-shrink-0"
        style={{
          ...box,
          width: AGENT_CHAT_REPEAT_MIN_WIDTH_PX,
          background: AGENT_CHAT_SEND_BACKGROUND_COLOR,
          color: AGENT_CHAT_REPEAT_LIT_COLOR,
          boxShadow: focusRing(true),
        }}
      />
    );
  }

  /** The accent says the next send goes more than once. */
  function color(): string {
    if (repeating !== null || repeats > REPEAT_LEAST) {
      return AGENT_CHAT_REPEAT_MANY_COLOR;
    }

    return press.isLit && !isLocked ? AGENT_CHAT_REPEAT_LIT_COLOR : AGENT_CHAT_REPEAT_COLOR;
  }

  return (
    <button
      type="button"
      aria-label={AGENT_CHAT_REPEAT_LABEL}
      disabled={isLocked}
      onClick={open}
      {...press.handlers}
      className="font-monospace d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        ...box,
        background: press.isLit && !isLocked ? INTERACTION_HOVER_BACKGROUND_COLOR : AGENT_CHAT_SEND_BACKGROUND_COLOR,
        color: color(),
        cursor: isLocked ? "default" : "pointer",
        boxShadow: focusRing(press.isFocused),
      }}
    >
      {repeating === null ? `${AGENT_CHAT_REPEAT_MARK}${repeats}` : `${repeating.sent}/${repeating.total}`}
    </button>
  );
}
