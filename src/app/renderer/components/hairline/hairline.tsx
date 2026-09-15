import { HAIRLINE_COLOR } from "../../constants";
import type { HairlineProps } from "./interfaces";

/** The one-pixel rule that parts two blocks. */
export function Hairline({ color = HAIRLINE_COLOR, margin, className }: HairlineProps) {
  return (
    <span
      className={className}
      style={{
        display: "block",
        height: 1,
        margin,
        background: color,
      }}
    />
  );
}
