import { WORKING_DOTS, WORKING_DOTS_CYCLE_MS, WORKING_DOTS_GAP_PX, WORKING_DOTS_STEP_MS } from "./constants";
import type { WorkingDotsProps } from "./interfaces";

/** Three dots running while a turn is out, each fading on its own delay. */
export function WorkingDots({ color, size }: WorkingDotsProps) {
  return (
    <span
      className="d-flex align-items-center"
      style={{
        gap: WORKING_DOTS_GAP_PX,
      }}
    >
      {WORKING_DOTS.map((dot) => (
        <span
          key={dot}
          className="work-dot"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            animationDuration: `${WORKING_DOTS_CYCLE_MS}ms`,
            animationDelay: `${dot * WORKING_DOTS_STEP_MS}ms`,
          }}
        />
      ))}
    </span>
  );
}
