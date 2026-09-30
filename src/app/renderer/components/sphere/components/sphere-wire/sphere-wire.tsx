import { sphereGridLines } from "../../../../utils/math";
import { mixWithTransparent } from "../../../../utils/colors";
import {
  SPHERE_AMBIENT_GLOW_SCALE,
  SPHERE_BREATHE_CORE_PERCENT,
  SPHERE_BREATHE_CORE_STOP_PERCENT,
  SPHERE_BREATHE_CYCLE_MS,
  SPHERE_BREATHE_EDGE_PERCENT,
  SPHERE_BREATHE_EDGE_STOP_PERCENT,
  SPHERE_BREATHE_END_STOP_PERCENT,
  SPHERE_BREATHE_INSET_PERCENT,
  SPHERE_BREATHE_SIZE_PERCENT,
  SPHERE_GRID_LINE_COUNT,
  SPHERE_GRID_STROKE_WIDTH,
  SPHERE_HOVER_RING_PERCENT,
  SPHERE_HOVER_RING_SIZE_PX,
  SPHERE_SIZE_PX,
  SPHERE_TILT_DEGREES,
} from "../../constants";
import type { SphereWireProps } from "./interfaces";

const SPHERE_RADIUS_PX = SPHERE_SIZE_PX / 2;
const AMBIENT_GLOW_SIZE_PX = SPHERE_SIZE_PX * SPHERE_AMBIENT_GLOW_SCALE;
/** The wireframe's paths, identical for every sphere. */
const GRID_LINES = sphereGridLines(SPHERE_GRID_LINE_COUNT, SPHERE_RADIUS_PX, SPHERE_TILT_DEGREES);

/** The wireframe: glow, the ring under the pointer, and the breath of an aim. */
export function SphereWire({ accentColor, glowColor, ambientGlowColor, isBreathing, isPointedAt }: SphereWireProps) {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: AMBIENT_GLOW_SIZE_PX,
          height: AMBIENT_GLOW_SIZE_PX,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ambientGlowColor} 0%, transparent 70%)`,
        }}
      />
      {/* Only the aim breathes; an off agent has no light. */}
      {isBreathing && (
        <div
          className="sphere-breathe"
          style={{
            position: "absolute",
            left: `${SPHERE_BREATHE_INSET_PERCENT}%`,
            top: `${SPHERE_BREATHE_INSET_PERCENT}%`,
            width: `${SPHERE_BREATHE_SIZE_PERCENT}%`,
            height: `${SPHERE_BREATHE_SIZE_PERCENT}%`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${mixWithTransparent(accentColor, SPHERE_BREATHE_CORE_PERCENT)} ${SPHERE_BREATHE_CORE_STOP_PERCENT}%, ${mixWithTransparent(accentColor, SPHERE_BREATHE_EDGE_PERCENT)} ${SPHERE_BREATHE_EDGE_STOP_PERCENT}%, transparent ${SPHERE_BREATHE_END_STOP_PERCENT}%)`,
            animationDuration: `${SPHERE_BREATHE_CYCLE_MS}ms`,
            pointerEvents: "none",
          }}
        />
      )}
      {isPointedAt && (
        <div
          style={{
            position: "absolute",
            width: SPHERE_HOVER_RING_SIZE_PX,
            height: SPHERE_HOVER_RING_SIZE_PX,
            borderRadius: "50%",
            border: `1px solid ${mixWithTransparent(accentColor, SPHERE_HOVER_RING_PERCENT)}`,
          }}
        />
      )}
      <svg
        width={SPHERE_SIZE_PX}
        height={SPHERE_SIZE_PX}
        viewBox={`0 0 ${SPHERE_SIZE_PX} ${SPHERE_SIZE_PX}`}
        style={{
          position: "relative",
          overflow: "visible",
        }}
      >
        <defs>
          <filter id="sphere-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={SPHERE_GRID_STROKE_WIDTH * 4} />
          </filter>
        </defs>
        <g filter="url(#sphere-glow)" stroke={glowColor} strokeWidth={SPHERE_GRID_STROKE_WIDTH * 2}>
          {GRID_LINES.map(({ path }, index) => (
            <path key={index} d={path} fill="none" />
          ))}
        </g>
        <g stroke={accentColor} strokeWidth={SPHERE_GRID_STROKE_WIDTH}>
          {GRID_LINES.map(({ path }, index) => (
            <path key={index} d={path} fill="none" />
          ))}
        </g>
      </svg>
    </div>
  );
}
