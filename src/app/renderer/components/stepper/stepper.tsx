import { INTERACTION_TRANSITION } from "../../constants";
import { roundedTo } from "../../utils/math";
import {
  STEPPER_BUTTON_BORDER_COLOR,
  STEPPER_BUTTON_BORDER_RADIUS_PX,
  STEPPER_BUTTON_COLOR,
  STEPPER_BUTTON_FONT_SIZE_PX,
  STEPPER_BUTTON_SIZE_PX,
  STEPPER_DISABLED_OPACITY,
  STEPPER_GAP_PX,
  STEPPER_LESS_LABEL,
  STEPPER_MORE_LABEL,
  STEPPER_PLACES,
  STEPPER_STEP,
  STEPPER_VALUE_COLOR,
  STEPPER_VALUE_FONT_SIZE_PX,
  STEPPER_VALUE_MIN_WIDTH_PX,
} from "./constants";
import type { StepperProps } from "./interfaces";

/** Stepper with −/+ buttons, held inside its bounds and written to its own places. */
export function Stepper({
  label,
  ref,
  value,
  onChange,
  step: by = STEPPER_STEP,
  least,
  most = Number.POSITIVE_INFINITY,
  places = STEPPER_PLACES,
  floorLabel,
}: StepperProps) {
  // A row nobody has written stands empty, and the first step up writes the least it may hold.
  const isLeast = value === null || value <= least;
  const isMost = value !== null && value >= most;
  // A run of tenths is not exact, so each step is rounded to the places the value is written to.
  const step = (moved: number) =>
    onChange(value === null ? least : roundedTo(Math.min(most, Math.max(least, value + moved)), places));
  const buttonStyle = {
    width: STEPPER_BUTTON_SIZE_PX,
    height: STEPPER_BUTTON_SIZE_PX,
    padding: 0,
    borderRadius: STEPPER_BUTTON_BORDER_RADIUS_PX,
    border: `1px solid ${STEPPER_BUTTON_BORDER_COLOR}`,
    background: "transparent",
    color: STEPPER_BUTTON_COLOR,
    fontSize: STEPPER_BUTTON_FONT_SIZE_PX,
    transition: INTERACTION_TRANSITION,
  };

  return (
    <span
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: STEPPER_GAP_PX,
      }}
    >
      <button
        type="button"
        aria-label={`${label}: ${STEPPER_LESS_LABEL}`}
        disabled={isLeast}
        onClick={() => step(-by)}
        className="d-flex align-items-center justify-content-center"
        style={{
          ...buttonStyle,
          opacity: isLeast ? STEPPER_DISABLED_OPACITY : 1,
          cursor: isLeast ? "default" : "pointer",
        }}
      >
        {STEPPER_LESS_LABEL}
      </button>
      <span
        className="font-monospace text-center"
        style={{
          minWidth: STEPPER_VALUE_MIN_WIDTH_PX,
          color: STEPPER_VALUE_COLOR,
          fontSize: STEPPER_VALUE_FONT_SIZE_PX,
        }}
      >
        {value === null ? "" : floorLabel !== undefined && value <= least ? floorLabel : value.toFixed(places)}
      </span>
      <button
        type="button"
        ref={ref}
        aria-label={`${label}: ${STEPPER_MORE_LABEL}`}
        disabled={isMost}
        onClick={() => step(by)}
        className="d-flex align-items-center justify-content-center"
        style={{
          ...buttonStyle,
          opacity: isMost ? STEPPER_DISABLED_OPACITY : 1,
          cursor: isMost ? "default" : "pointer",
        }}
      >
        {STEPPER_MORE_LABEL}
      </button>
    </span>
  );
}
