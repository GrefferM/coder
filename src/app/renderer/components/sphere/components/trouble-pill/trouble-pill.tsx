import {
  SPHERE_TROUBLE_BREAK_COLOR,
  SPHERE_TROUBLE_FACT_COLOR,
  SPHERE_TROUBLE_PILL_BORDER_RADIUS_PX,
  SPHERE_TROUBLE_PILL_FONT_SIZE_PX,
  SPHERE_TROUBLE_PILL_GAP_PX,
  SPHERE_TROUBLE_PILL_LETTER_SPACING_PX,
  SPHERE_TROUBLE_PILL_PADDING,
} from "../../constants";
import type { TroublePillProps } from "./interfaces";

/** The dashed pill under the name saying in a word what is missing. */
export function TroublePill({ label, isBreak }: TroublePillProps) {
  return (
    <span
      className="d-flex justify-content-center"
      style={{
        marginTop: SPHERE_TROUBLE_PILL_GAP_PX,
      }}
    >
      <span
        className="font-monospace"
        style={{
          padding: SPHERE_TROUBLE_PILL_PADDING,
          borderRadius: SPHERE_TROUBLE_PILL_BORDER_RADIUS_PX,
          border: `1px dashed ${isBreak ? SPHERE_TROUBLE_BREAK_COLOR : SPHERE_TROUBLE_FACT_COLOR}`,
          color: isBreak ? SPHERE_TROUBLE_BREAK_COLOR : SPHERE_TROUBLE_FACT_COLOR,
          fontSize: SPHERE_TROUBLE_PILL_FONT_SIZE_PX,
          letterSpacing: SPHERE_TROUBLE_PILL_LETTER_SPACING_PX,
        }}
      >
        {label}
      </span>
    </span>
  );
}
