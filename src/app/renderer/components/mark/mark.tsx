import { MARK_FONT_SIZE_PX, MARK_LETTER_SPACING_PX, QUIET_MARK_COLOR } from "../../constants";
import type { MarkProps } from "./interfaces";

/**
 * The quiet mono caption naming a block, a state or a count; placement is the caller's via `className`. A sentence,
 * price or path keeps its own case.
 */
export function Mark({
  children,
  color = QUIET_MARK_COLOR,
  size = MARK_FONT_SIZE_PX,
  spacing = MARK_LETTER_SPACING_PX,
  lineHeight,
  isUpperCase = true,
  className,
}: MarkProps) {
  return (
    <span
      className={`font-monospace${isUpperCase ? " text-uppercase" : ""}${className === undefined ? "" : ` ${className}`}`}
      style={{
        color,
        fontSize: size,
        letterSpacing: spacing,
        lineHeight,
      }}
    >
      {children}
    </span>
  );
}
