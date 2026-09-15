import {
  SPHERE_LABEL_FONT_SIZE_PX,
  SPHERE_LABEL_LETTER_SPACING_PX,
  SPHERE_LABEL_LIT_SUBTEXT_COLOR,
  SPHERE_LABEL_SUBTEXT_COLOR,
  SPHERE_LABEL_SUBTEXT_FONT_SIZE_PX,
  SPHERE_STATUS_DOT_COLOR,
  SPHERE_STATUS_DOT_SIZE_PX,
  SPHERE_INACTIVE_STATUS_DOT_COLOR,
} from "./constants";
import type { SphereLabelProps } from "./interfaces";

/** Sphere label: name in accent colour with the state dot, model on a dimmer line beneath. */
export function SphereLabel({
  name,
  subtext,
  accentColor,
  isActive = true,
  isLit = false,
  isDrawnSmall = false,
  stateColor,
}: SphereLabelProps) {
  // State colour when provided, else the plain live/off pair.
  const dotColor = stateColor ?? (isActive ? SPHERE_STATUS_DOT_COLOR : SPHERE_INACTIVE_STATUS_DOT_COLOR);

  return (
    <div className="d-flex flex-column align-items-center text-center text-uppercase font-monospace">
      <div
        className="d-flex align-items-center"
        style={{
          color: accentColor,
          fontSize: SPHERE_LABEL_FONT_SIZE_PX,
          letterSpacing: SPHERE_LABEL_LETTER_SPACING_PX,
        }}
      >
        {name}
        <span
          className="d-inline-block rounded-circle"
          style={{
            width: SPHERE_STATUS_DOT_SIZE_PX,
            height: SPHERE_STATUS_DOT_SIZE_PX,
            marginLeft: SPHERE_LABEL_LETTER_SPACING_PX * 2,
            backgroundColor: dotColor,
            boxShadow: isActive ? `0 0 6px ${dotColor}` : "none",
          }}
        />
      </div>
      {subtext && (
        <div
          style={{
            color: isLit || isDrawnSmall ? SPHERE_LABEL_LIT_SUBTEXT_COLOR : SPHERE_LABEL_SUBTEXT_COLOR,
            fontSize: SPHERE_LABEL_SUBTEXT_FONT_SIZE_PX,
            letterSpacing: SPHERE_LABEL_LETTER_SPACING_PX,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}
