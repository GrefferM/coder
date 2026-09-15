import {
  GLOW_PARTICLE_RADIUS_PX,
  GLOW_OVERLAY_MARGIN_PX,
  GLOW_PARTICLE_COUNT,
  GLOW_PERIMETER_PX_PER_SECOND,
  GLOW_COLOR,
  GLOW_FADE_SECONDS,
} from "./constants";
import { roundedRectPath } from "./rounded-rect-path";
import { type ButtonGlowProps } from "./interfaces";

/** Hover glow: the button's border outline with particles animated along it. */
export function ButtonGlow({ width, height, borderRadius, isVisible }: ButtonGlowProps) {
  const linePath = roundedRectPath(width, height, borderRadius);
  const perimeterPx = 2 * (width + height);
  const durationSeconds = perimeterPx / GLOW_PERIMETER_PX_PER_SECOND;
  const overlayWidth = width + GLOW_OVERLAY_MARGIN_PX * 2;
  const overlayHeight = height + GLOW_OVERLAY_MARGIN_PX * 2;

  const particles = Array.from(
    {
      length: GLOW_PARTICLE_COUNT,
    },
    (_, index) => {
      const beginSeconds = -((index / GLOW_PARTICLE_COUNT) * durationSeconds);

      return (
        <circle
          key={index}
          r={GLOW_PARTICLE_RADIUS_PX}
          fill={GLOW_COLOR}
          style={{
            filter: `drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 4px ${GLOW_COLOR}) drop-shadow(0 0 7px ${GLOW_COLOR})`,
          }}
        >
          <animateMotion
            dur={`${durationSeconds.toFixed(2)}s`}
            begin={`${beginSeconds.toFixed(2)}s`}
            repeatCount="indefinite"
            path={linePath}
          />
        </circle>
      );
    },
  );

  return (
    <svg
      className="position-absolute"
      style={{
        left: -GLOW_OVERLAY_MARGIN_PX,
        top: -GLOW_OVERLAY_MARGIN_PX,
        overflow: "visible",
        pointerEvents: "none",
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${GLOW_FADE_SECONDS}s ease`,
      }}
      width={overlayWidth}
      height={overlayHeight}
      viewBox={`-${GLOW_OVERLAY_MARGIN_PX} -${GLOW_OVERLAY_MARGIN_PX} ${overlayWidth} ${overlayHeight}`}
    >
      <path
        d={linePath}
        fill="none"
        stroke={GLOW_COLOR}
        strokeWidth={1.5}
        style={{
          filter: `drop-shadow(0 0 1px ${GLOW_COLOR})`,
        }}
      />
      {particles}
    </svg>
  );
}
