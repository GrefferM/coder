import { INTERACTION_TRANSITION } from "../../constants";
import {
  TOGGLE_BORDER_RADIUS_PX,
  TOGGLE_HEIGHT_PX,
  TOGGLE_INSET_PX,
  TOGGLE_KNOB_COLOR,
  TOGGLE_KNOB_SIZE_PX,
  TOGGLE_OFF_COLOR,
  TOGGLE_ON_COLOR,
  TOGGLE_WIDTH_PX,
} from "./constants";
import type { ToggleProps } from "./interfaces";

/** Switch — the track takes the live colour while on, the knob sits at the on side. */
export function Toggle({ label, isOn, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      onClick={() => onChange(!isOn)}
      className="d-flex align-items-center flex-shrink-0"
      style={{
        width: TOGGLE_WIDTH_PX,
        height: TOGGLE_HEIGHT_PX,
        padding: TOGGLE_INSET_PX,
        border: "none",
        borderRadius: TOGGLE_BORDER_RADIUS_PX,
        background: isOn ? TOGGLE_ON_COLOR : TOGGLE_OFF_COLOR,
        justifyContent: isOn ? "flex-end" : "flex-start",
        cursor: "pointer",
        transition: INTERACTION_TRANSITION,
      }}
    >
      <span
        style={{
          width: TOGGLE_KNOB_SIZE_PX,
          height: TOGGLE_KNOB_SIZE_PX,
          borderRadius: "50%",
          background: TOGGLE_KNOB_COLOR,
        }}
      />
    </button>
  );
}
