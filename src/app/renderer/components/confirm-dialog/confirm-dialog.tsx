import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { ActionButton } from "../action-button";
import { useAttentionPulse, useInteraction, useWindowKeydown } from "../../hooks";
import {
  ATTENTION_PULSE_SCALE,
  ATTENTION_PULSE_TRANSITION,
  CONFIRM_LAYER,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_TRANSITION,
} from "../../constants";
import {
  CONFIRM_DIALOG_ACTIONS_GAP_PX,
  CONFIRM_DIALOG_ACTIONS_TOP_PX,
  CONFIRM_DIALOG_BACKGROUND_COLOR,
  CONFIRM_DIALOG_BORDER_RADIUS_PX,
  CONFIRM_DIALOG_CALM_BORDER_COLOR,
  CONFIRM_DIALOG_CALM_ICON_COLOR,
  CONFIRM_DIALOG_CALM_QUESTION_COLOR,
  CONFIRM_DIALOG_DANGER_BORDER_COLOR,
  CONFIRM_DIALOG_DANGER_QUESTION_COLOR,
  CONFIRM_DIALOG_GAP_PX,
  CONFIRM_DIALOG_HEADER_GAP_PX,
  CONFIRM_DIALOG_ICON_SIZE_PX,
  CONFIRM_DIALOG_NO_LABEL,
  CONFIRM_DIALOG_PADDING_PX,
  CONFIRM_DIALOG_QUESTION_FONT_SIZE_PX,
  CONFIRM_DIALOG_SCRIM_COLOR,
  CONFIRM_DIALOG_STAY_BACKDROP_RADIUS_PX,
  CONFIRM_DIALOG_STAY_COLOR,
  CONFIRM_DIALOG_STAY_FONT_SIZE_PX,
  CONFIRM_DIALOG_STAY_LETTER_SPACING_PX,
  CONFIRM_DIALOG_STAY_PADDING,
  CONFIRM_DIALOG_STAY_TOP_PX,
  CONFIRM_DIALOG_WIDTH_PX,
  CONFIRM_DIALOG_YES_LABEL,
} from "./constants";
import type { ConfirmDialogProps } from "./interfaces";
import { focusRing } from "../../utils/focus";

/** Confirm dialog; a click outside pulses the box — only Escape or the stay line dismisses. */
export function ConfirmDialog({
  question,
  children,
  tone = "danger",
  hasScrim = true,
  noLabel = CONFIRM_DIALOG_NO_LABEL,
  yesLabel = CONFIRM_DIALOG_YES_LABEL,
  yesVariant,
  stayLabel,
  onConfirm,
  onDecline,
  onDismiss,
}: ConfirmDialogProps) {
  const isCalm = tone === "calm";
  const isAnswerable = yesLabel !== null;
  const declineRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const stay = useInteraction();
  const pulse = useAttentionPulse();

  // Initial focus goes to the safe answer.
  useEffect(() => {
    const safe = isCalm && isAnswerable ? confirmRef.current : declineRef.current;

    safe?.focus();
  }, [isCalm, isAnswerable]);

  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      onDismiss();
    }
  });

  /** `←`/`→` move focus between the two answers. */
  function walk(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    (event.key === "ArrowLeft" ? declineRef : confirmRef).current?.focus();
  }

  return (
    <div
      onClick={pulse.strike}
      role="presentation"
      className="d-flex align-items-center justify-content-center"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: CONFIRM_LAYER,
        background: hasScrim ? CONFIRM_DIALOG_SCRIM_COLOR : undefined,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        onKeyDown={walk}
        role="presentation"
        className="d-flex flex-column"
        style={{
          width: CONFIRM_DIALOG_WIDTH_PX,
          gap: CONFIRM_DIALOG_GAP_PX,
          padding: CONFIRM_DIALOG_PADDING_PX,
          borderRadius: CONFIRM_DIALOG_BORDER_RADIUS_PX,
          border: `1px solid ${isCalm ? CONFIRM_DIALOG_CALM_BORDER_COLOR : CONFIRM_DIALOG_DANGER_BORDER_COLOR}`,
          background: CONFIRM_DIALOG_BACKGROUND_COLOR,
          transform: pulse.isStruck ? `scale(${ATTENTION_PULSE_SCALE})` : undefined,
          transition: ATTENTION_PULSE_TRANSITION,
        }}
      >
        <div
          className="d-flex align-items-center"
          style={{
            gap: CONFIRM_DIALOG_HEADER_GAP_PX,
          }}
        >
          <svg
            width={CONFIRM_DIALOG_ICON_SIZE_PX}
            height={CONFIRM_DIALOG_ICON_SIZE_PX}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isCalm ? CONFIRM_DIALOG_CALM_ICON_COLOR : CONFIRM_DIALOG_DANGER_QUESTION_COLOR}
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5h.01" />
          </svg>
          <span
            style={{
              color: isCalm ? CONFIRM_DIALOG_CALM_QUESTION_COLOR : CONFIRM_DIALOG_DANGER_QUESTION_COLOR,
              fontSize: CONFIRM_DIALOG_QUESTION_FONT_SIZE_PX,
              fontWeight: 600,
              overflowWrap: "anywhere",
            }}
          >
            {question}
          </span>
        </div>
        {children}
        <div
          className="d-flex flex-column"
          style={{
            paddingTop: CONFIRM_DIALOG_ACTIONS_TOP_PX,
          }}
        >
          <div
            className="d-flex"
            style={{
              gap: CONFIRM_DIALOG_ACTIONS_GAP_PX,
            }}
          >
            <ActionButton ref={declineRef} variant="cancel" label={noLabel} onClick={onDecline ?? onDismiss} />
            {isAnswerable && (
              <ActionButton
                ref={confirmRef}
                variant={yesVariant ?? (isCalm ? "save" : "danger")}
                label={yesLabel}
                onClick={onConfirm}
              />
            )}
          </div>
          {stayLabel !== undefined && (
            <button
              type="button"
              onClick={onDismiss}
              {...stay.handlers}
              className="font-monospace text-uppercase text-center"
              style={{
                marginTop: CONFIRM_DIALOG_STAY_TOP_PX,
                padding: CONFIRM_DIALOG_STAY_PADDING,
                border: "none",
                borderRadius: CONFIRM_DIALOG_STAY_BACKDROP_RADIUS_PX,
                background: stay.isLit ? INTERACTION_HOVER_BACKGROUND_COLOR : "transparent",
                color: stay.isLit ? INTERACTION_HOVER_TEXT_COLOR : CONFIRM_DIALOG_STAY_COLOR,
                fontSize: CONFIRM_DIALOG_STAY_FONT_SIZE_PX,
                letterSpacing: CONFIRM_DIALOG_STAY_LETTER_SPACING_PX,
                cursor: "pointer",
                outline: "none",
                boxShadow: focusRing(stay.isFocused),
                transition: INTERACTION_TRANSITION,
              }}
            >
              {stayLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
