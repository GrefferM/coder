import { useInteraction } from "../../hooks";
import {
  INTERACTION_ACCENT_COLOR,
  INTERACTION_ACCENT_HOVER_COLOR,
  INTERACTION_HOVER_BACKGROUND_COLOR,
  INTERACTION_HOVER_BORDER_COLOR,
  INTERACTION_HOVER_TEXT_COLOR,
  INTERACTION_PRESSED_BACKGROUND_COLOR,
  INTERACTION_PRESSED_SHIFT_PX,
  INTERACTION_TRANSITION,
} from "../../constants";
import {
  NESTED_ACTIONS_GAP_PX,
  NESTED_ACTION_BORDER_RADIUS_PX,
  NESTED_ACTION_CANCEL_COLOR,
  NESTED_ACTION_CONFIRM_BACKGROUND_COLOR,
  NESTED_ACTION_CONFIRM_BORDER_COLOR,
  NESTED_ACTION_DISABLED_OPACITY,
  NESTED_ACTION_FONT_SIZE_PX,
  NESTED_ACTION_LETTER_SPACING_PX,
  NESTED_ACTION_PADDING,
} from "./constants";
import type { NestedActionsProps } from "./interfaces";

/** Cancel/confirm pair of a nested block — mono, right-aligned, distinct from the panel's own actions. */
export function NestedActions({
  cancelLabel,
  confirmLabel,
  isConfirmDisabled = false,
  onCancel,
  onConfirm,
}: NestedActionsProps) {
  const cancel = useInteraction();
  const confirm = useInteraction();
  const shared = {
    padding: NESTED_ACTION_PADDING,
    borderRadius: NESTED_ACTION_BORDER_RADIUS_PX,
    fontSize: NESTED_ACTION_FONT_SIZE_PX,
    letterSpacing: NESTED_ACTION_LETTER_SPACING_PX,
    cursor: "pointer",
    transition: INTERACTION_TRANSITION,
  };
  const isHeld = confirm.isPressed && !isConfirmDisabled;

  return (
    <div
      className="d-flex justify-content-end"
      style={{
        gap: NESTED_ACTIONS_GAP_PX,
      }}
    >
      <button
        type="button"
        {...cancel.handlers}
        onClick={onCancel}
        className="font-monospace text-uppercase text-nowrap"
        style={{
          ...shared,
          border: "1px solid transparent",
          background: cancel.isPressed
            ? INTERACTION_PRESSED_BACKGROUND_COLOR
            : cancel.isLit
              ? INTERACTION_HOVER_BACKGROUND_COLOR
              : "transparent",
          color: cancel.isLit && !cancel.isPressed ? INTERACTION_HOVER_TEXT_COLOR : NESTED_ACTION_CANCEL_COLOR,
          transform: cancel.isPressed ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        }}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        disabled={isConfirmDisabled}
        {...confirm.handlers}
        onClick={onConfirm}
        className="font-monospace text-uppercase text-nowrap"
        style={{
          ...shared,
          border: `1px solid ${confirm.isLit && !isConfirmDisabled ? INTERACTION_HOVER_BORDER_COLOR : NESTED_ACTION_CONFIRM_BORDER_COLOR}`,
          background: isHeld ? INTERACTION_PRESSED_BACKGROUND_COLOR : NESTED_ACTION_CONFIRM_BACKGROUND_COLOR,
          color:
            confirm.isLit && !isHeld && !isConfirmDisabled ? INTERACTION_ACCENT_HOVER_COLOR : INTERACTION_ACCENT_COLOR,
          opacity: isConfirmDisabled ? NESTED_ACTION_DISABLED_OPACITY : 1,
          cursor: isConfirmDisabled ? "default" : "pointer",
          transform: isHeld ? `translateY(${INTERACTION_PRESSED_SHIFT_PX}px)` : undefined,
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
