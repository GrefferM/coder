import { CHIP_BORDER_RADIUS_PX, CHIP_FONT_SIZE_PX, CHIP_PADDING } from "./constants";
import type { ChipProps } from "./interfaces";

/** One mono value in a soft box, at the measure every such box keeps. */
export function Chip({ children, color, background, gap, className }: ChipProps) {
  const layout = gap === undefined ? "" : " d-flex align-items-center";

  return (
    <span
      className={`font-monospace flex-shrink-0${layout}${className === undefined ? "" : ` ${className}`}`}
      style={{
        padding: CHIP_PADDING,
        borderRadius: CHIP_BORDER_RADIUS_PX,
        background,
        color,
        fontSize: CHIP_FONT_SIZE_PX,
        gap,
      }}
    >
      {children}
    </span>
  );
}
