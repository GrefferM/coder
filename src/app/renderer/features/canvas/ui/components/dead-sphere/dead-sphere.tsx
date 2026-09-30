import { SPHERE_LABEL_GAP_PX, SPHERE_SIZE_PX } from "../../../../../components/sphere/constants";
import {
  DEAD_SPHERE_BORDER,
  DEAD_SPHERE_GAP_PX,
  DEAD_SPHERE_GLOW,
  DEAD_SPHERE_ID_COLOR,
  DEAD_SPHERE_ID_FONT_SIZE_PX,
  DEAD_SPHERE_ID_LENGTH,
  DEAD_SPHERE_ID_LETTER_SPACING_PX,
  DEAD_SPHERE_NOTE_BACKGROUND_COLOR,
  DEAD_SPHERE_NOTE_BORDER,
  DEAD_SPHERE_NOTE_BORDER_RADIUS_PX,
  DEAD_SPHERE_NOTE_COLOR,
  DEAD_SPHERE_NOTE_FONT_SIZE_PX,
  DEAD_SPHERE_NOTE_LABEL,
  DEAD_SPHERE_NOTE_LETTER_SPACING_PX,
  DEAD_SPHERE_NOTE_PADDING,
} from "./constants";
import type { DeadSphereProps } from "./interfaces";

/**
 * The end of a line that names nobody: a dashed ring with nothing inside, no name, model or colour, and no «?» since
 * the whole agent is missing.
 */
export function DeadSphere({ agentId, at }: DeadSphereProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: at.x,
        top: at.y,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: SPHERE_SIZE_PX,
          height: SPHERE_SIZE_PX,
          borderRadius: "50%",
          border: DEAD_SPHERE_BORDER,
          background: DEAD_SPHERE_GLOW,
        }}
      />
      <div
        className="d-flex flex-column align-items-center text-nowrap"
        style={{
          position: "absolute",
          left: "50%",
          top: "100%",
          transform: "translateX(-50%)",
          marginTop: SPHERE_LABEL_GAP_PX,
          gap: DEAD_SPHERE_GAP_PX,
        }}
      >
        <span
          className="font-monospace"
          style={{
            fontSize: DEAD_SPHERE_ID_FONT_SIZE_PX,
            letterSpacing: DEAD_SPHERE_ID_LETTER_SPACING_PX,
            color: DEAD_SPHERE_ID_COLOR,
          }}
        >
          {agentId.slice(0, DEAD_SPHERE_ID_LENGTH).toUpperCase()}
        </span>
        <span
          className="font-monospace"
          style={{
            padding: DEAD_SPHERE_NOTE_PADDING,
            borderRadius: DEAD_SPHERE_NOTE_BORDER_RADIUS_PX,
            background: DEAD_SPHERE_NOTE_BACKGROUND_COLOR,
            border: DEAD_SPHERE_NOTE_BORDER,
            fontSize: DEAD_SPHERE_NOTE_FONT_SIZE_PX,
            letterSpacing: DEAD_SPHERE_NOTE_LETTER_SPACING_PX,
            color: DEAD_SPHERE_NOTE_COLOR,
          }}
        >
          {DEAD_SPHERE_NOTE_LABEL}
        </span>
      </div>
    </div>
  );
}
