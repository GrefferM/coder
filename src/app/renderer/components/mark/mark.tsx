import { MARK_FONT_SIZE_PX, MARK_LETTER_SPACING_PX, QUIET_MARK_COLOR } from "../../constants";
import type { MarkProps } from "./interfaces";

/**
 * The quiet mono caption — what names a block, a state or a count. It carries the type and nothing else:
 * where it stands in its row is the caller's to say, through `className`. Upper case is the mark's own voice, and a
 * mark that says a whole sentence, a price or a path keeps its own case instead.
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
