import { offsetLabel } from "../../../../../../../../utils/dates";
import {
  RUN_GRAPH_RULER_COLOR,
  RUN_GRAPH_RULER_FONT_SIZE_PX,
  RUN_GRAPH_RULER_LETTER_SPACING_PX,
  RUN_GRAPH_RULER_TOP_PX,
  RUN_GRAPH_RULER_WIDTH_PX,
} from "../../constants";
import type { GraphRulerProps } from "./interfaces";

const RULER_HALF_PX = RUN_GRAPH_RULER_WIDTH_PX / 2;

/**
 * A mark over every column: when that turn began, counted from when the question was asked. Follows the field across,
 * keeps its size, stays at the top.
 */
export function GraphRuler({ turns, askedAt, pan, scale }: GraphRulerProps) {
  return (
    <>
      {turns.map((turn) => (
        <div
          key={turn.place.step.id}
          className="font-monospace text-center"
          style={{
            position: "absolute",
            left: pan.x + turn.at.x * scale - RULER_HALF_PX,
            top: RUN_GRAPH_RULER_TOP_PX,
            width: RUN_GRAPH_RULER_WIDTH_PX,
            color: RUN_GRAPH_RULER_COLOR,
            fontSize: RUN_GRAPH_RULER_FONT_SIZE_PX,
            letterSpacing: RUN_GRAPH_RULER_LETTER_SPACING_PX,
            pointerEvents: "none",
          }}
        >
          {offsetLabel(turn.place.step.startedAt.getTime() - askedAt.getTime())}
        </div>
      ))}
    </>
  );
}
