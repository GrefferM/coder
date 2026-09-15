import {
  LINK_COUNTS_SAMPLE_HEIGHT_PX,
  LINK_COUNTS_SAMPLE_POINTS,
  LINK_COUNTS_SAMPLE_VIEW_BOX,
  LINK_COUNTS_SAMPLE_WIDTH_PX,
} from "../../constants";
import type { SampleProps } from "./interfaces";

/** Line sample drawn like the counted line. */
export function Sample({ color, width }: SampleProps) {
  return (
    <svg
      width={LINK_COUNTS_SAMPLE_WIDTH_PX}
      height={LINK_COUNTS_SAMPLE_HEIGHT_PX}
      viewBox={LINK_COUNTS_SAMPLE_VIEW_BOX}
    >
      <line x1="0" y1="3" x2="20" y2="3" stroke={color} strokeWidth={width} />
      <polygon points={LINK_COUNTS_SAMPLE_POINTS} fill={color} />
    </svg>
  );
}
