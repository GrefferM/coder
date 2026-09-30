import {
  SPHERE_TROUBLE_BREAK_COLOR,
  SPHERE_TROUBLE_FACT_COLOR,
  SPHERE_TROUBLE_MARK,
  SPHERE_TROUBLE_MARK_OFFSET_PX,
  SPHERE_TROUBLE_MARK_SIZE_PX,
} from "../../constants";
import type { TroubleMarkProps } from "./interfaces";

/** The mark on the ring for something missing, a fact or a break, in its own colour. */
export function TroubleMark({ isBreak, markScale }: TroubleMarkProps) {
  return (
    <span
      className="d-flex align-items-center justify-content-center font-monospace"
      style={{
        position: "absolute",
        top: SPHERE_TROUBLE_MARK_OFFSET_PX,
        right: SPHERE_TROUBLE_MARK_OFFSET_PX,
        width: SPHERE_TROUBLE_MARK_SIZE_PX,
        height: SPHERE_TROUBLE_MARK_SIZE_PX,
        color: isBreak ? SPHERE_TROUBLE_BREAK_COLOR : SPHERE_TROUBLE_FACT_COLOR,
        fontSize: SPHERE_TROUBLE_MARK_SIZE_PX,
        lineHeight: 1,
        // Scales around its middle, staying where it sits on the ring.
        transform: `scale(${markScale})`,
      }}
    >
      {SPHERE_TROUBLE_MARK}
    </span>
  );
}
