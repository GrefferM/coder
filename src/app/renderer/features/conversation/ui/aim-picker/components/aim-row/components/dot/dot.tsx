import { mixWithTransparent } from "../../../../../../../../utils/colors";
import {
  AIM_PICKER_DOT_MARGIN,
  AIM_PICKER_DOT_SIZE_PX,
  AIM_PICKER_OFF_DOT_PERCENT,
  AIM_PICKER_ROW_RING_OUTER_PX,
  AIM_PICKER_ROW_RING_WIDTH_PX,
} from "../../../../constants";
import type { DotProps } from "./interfaces";

/** The dot carries the colour; a ring marks the aimed one, no tick. */
export function Dot({ color, isActive, isAimed, ground }: DotProps) {
  return (
    <span
      className="flex-shrink-0"
      style={{
        width: AIM_PICKER_DOT_SIZE_PX,
        height: AIM_PICKER_DOT_SIZE_PX,
        margin: AIM_PICKER_DOT_MARGIN,
        borderRadius: "50%",
        background: isActive ? color : mixWithTransparent(color, AIM_PICKER_OFF_DOT_PERCENT),
        boxShadow: isAimed
          ? `0 0 0 ${AIM_PICKER_ROW_RING_WIDTH_PX}px ${ground}, 0 0 0 ${AIM_PICKER_ROW_RING_OUTER_PX}px ${color}`
          : undefined,
      }}
    />
  );
}
