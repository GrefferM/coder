import { walkDrawing } from "../../../projection";
import { mixWithTransparent } from "../../../../utils/colors";
import { WidgetSphere } from "../widget-sphere";
import { routeStanding, walkRoute } from "../../logic";
import {
  WIDGET_CAROUSEL_NAME_FONT_SIZE_PX,
  WIDGET_CAROUSEL_NAME_LETTER_SPACING_PX,
  WIDGET_CAROUSEL_SPHERE_PX,
  WIDGET_CELL_DIM_OPACITY,
  WIDGET_FAILURE_COLOR,
  WIDGET_RULE_COLOR,
  WIDGET_STRIP_AHEAD_ARROW_COLOR,
  WIDGET_STRIP_AHEAD_COLOR,
  WIDGET_STRIP_AHEAD_DASH,
  WIDGET_STRIP_AHEAD_OPACITY,
  WIDGET_STRIP_ARROW_PX,
  WIDGET_STRIP_ARROW_WING_PX,
  WIDGET_STRIP_CLOSE_COLUMN_PX,
  WIDGET_STRIP_CLOSE_FIRST_X_PX,
  WIDGET_STRIP_CORNER_PX,
  WIDGET_STRIP_FAILED_GLOW_PERCENT,
  WIDGET_STRIP_FAILED_RING_WIDTH_PX,
  WIDGET_STRIP_FLOW_ANIMATION,
  WIDGET_STRIP_FLOW_DASH,
  WIDGET_STRIP_FLOW_WIDTH,
  WIDGET_STRIP_FOOT_PX,
  WIDGET_STRIP_HEAD_AIR_SHARE,
  WIDGET_STRIP_LANE_HEIGHT_PX,
  WIDGET_STRIP_LINE_WIDTH,
  WIDGET_STRIP_NAME_TOP_PX,
  WIDGET_STRIP_NAME_WIDTH_PX,
  WIDGET_STRIP_PADDING,
  WIDGET_STRIP_REST_COLOR,
  WIDGET_STRIP_RING_AIR_PX,
  WIDGET_STRIP_RING_BORDER_PERCENT,
  WIDGET_STRIP_RING_GLOW_PERCENT,
  WIDGET_STRIP_RING_GLOW_PX,
  WIDGET_STRIP_TAIL_AIR_SHARE,
  WIDGET_STRIP_TOP_ROW_Y_PX,
  WIDGET_STRIP_TRAIL_PERCENT,
  WIDGET_STRIP_TRAIL_WIDTH,
  WIDGET_STRIP_WIDE_COLUMN_PX,
  WIDGET_STRIP_WIDE_COLUMNS,
  WIDGET_STRIP_WIDE_FIRST_X_PX,
  WIDGET_STRIP_WIDTH_PX,
} from "../../constants";
import type { Agent } from "../../../../interfaces";
import type { RouteStanding, RunStripProps } from "../../interfaces";

const RADIUS_PX = WIDGET_CAROUSEL_SPHERE_PX / 2;

/**
 * The walk's way in the carousel's place while it is out (52e–52i): every agent the lines reach from the sphere, laid
 * out as the projection lays a pass. One that answered stands whole, its line at rest; one at work wears a ring, the
 * line into it carrying the sender's colour; one not reached stands dim behind a dashed line; one that fell wears red.
 */
export function RunStrip({ agents, links, sphereId, exchange }: RunStripProps) {
  const route = walkRoute(agents, links, sphereId);
  const isWide = route.length <= WIDGET_STRIP_WIDE_COLUMNS;
  const columnWidth = isWide ? WIDGET_STRIP_WIDE_COLUMN_PX : WIDGET_STRIP_CLOSE_COLUMN_PX;
  const firstColumnX = isWide ? WIDGET_STRIP_WIDE_FIRST_X_PX : WIDGET_STRIP_CLOSE_FIRST_X_PX;
  const drawing = walkDrawing(route, {
    firstColumnX,
    columnWidth,
    topRowY: WIDGET_STRIP_TOP_ROW_Y_PX,
    laneHeight: WIDGET_STRIP_LANE_HEIGHT_PX,
    line: {
      radius: RADIUS_PX,
      tailAir: RADIUS_PX * WIDGET_STRIP_TAIL_AIR_SHARE,
      headAir: RADIUS_PX * WIDGET_STRIP_HEAD_AIR_SHARE,
      corner: WIDGET_STRIP_CORNER_PX,
      arrow: WIDGET_STRIP_ARROW_PX,
      wing: WIDGET_STRIP_ARROW_WING_PX,
    },
  });
  const lowest = Math.max(...drawing.turns.map((turn) => turn.at.y));
  const furthest = Math.max(...drawing.turns.map((turn) => turn.at.x));
  const agentOf = (agentId: string): Agent | null => agents.find((agent) => agent.id === agentId) ?? null;
  const standingOf = (agentId: string): RouteStanding => routeStanding(exchange, agentId);
  /** A line by where it leads: carrying work to a turn out, walked already, or not reached. */
  const lineOf = (fromId: string, toId: string) => {
    const reached = standingOf(toId);
    const senderColor = agentOf(fromId)?.color ?? WIDGET_STRIP_REST_COLOR;

    if (reached === "working") {
      return {
        color: senderColor,
        arrowColor: senderColor,
        trailColor: mixWithTransparent(senderColor, WIDGET_STRIP_TRAIL_PERCENT),
        flowColor: senderColor,
        dash: undefined,
        opacity: 1,
      };
    }

    if (reached === "waiting") {
      return {
        color: WIDGET_STRIP_AHEAD_COLOR,
        arrowColor: WIDGET_STRIP_AHEAD_ARROW_COLOR,
        trailColor: null,
        flowColor: null,
        dash: WIDGET_STRIP_AHEAD_DASH,
        opacity: WIDGET_STRIP_AHEAD_OPACITY,
      };
    }

    return {
      color: WIDGET_STRIP_REST_COLOR,
      arrowColor: WIDGET_STRIP_REST_COLOR,
      trailColor: null,
      flowColor: null,
      dash: undefined,
      opacity: 1,
    };
  };
  /** The one head a join draws: lit by a line carrying work, dim while every line into it is ahead. */
  const headColorOf = (toId: string) => {
    const into = drawing.lines.filter((line) => line.toId === toId).map((line) => lineOf(line.fromId, line.toId));
    const carrying = into.find((line) => line.flowColor !== null);

    if (carrying !== undefined) {
      return carrying.arrowColor;
    }

    return into.every((line) => line.dash !== undefined) ? WIDGET_STRIP_AHEAD_ARROW_COLOR : WIDGET_STRIP_REST_COLOR;
  };

  return (
    <div
      className="flex-shrink-0"
      style={{
        padding: WIDGET_STRIP_PADDING,
        overflowX: "auto",
        borderTop: `1px solid ${WIDGET_RULE_COLOR}`,
        borderBottom: `1px solid ${WIDGET_RULE_COLOR}`,
      }}
    >
      <div
        className="position-relative"
        style={{
          width: Math.max(WIDGET_STRIP_WIDTH_PX, furthest + WIDGET_STRIP_NAME_WIDTH_PX / 2),
          height: lowest + RADIUS_PX + WIDGET_STRIP_FOOT_PX,
        }}
      >
        <svg
          className="position-absolute w-100 h-100"
          style={{
            inset: 0,
            overflow: "visible",
          }}
        >
          {drawing.lines.map((line) => {
            const drawn = lineOf(line.fromId, line.toId);

            return (
              <g key={line.id} opacity={drawn.opacity}>
                {drawn.trailColor !== null && (
                  <path
                    d={line.path}
                    fill="none"
                    stroke={drawn.trailColor}
                    strokeWidth={WIDGET_STRIP_TRAIL_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                <path
                  d={line.path}
                  fill="none"
                  stroke={drawn.color}
                  strokeWidth={WIDGET_STRIP_LINE_WIDTH}
                  strokeDasharray={drawn.dash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {drawn.flowColor !== null && (
                  <path
                    d={line.path}
                    fill="none"
                    stroke={drawn.flowColor}
                    strokeWidth={WIDGET_STRIP_FLOW_WIDTH}
                    strokeDasharray={WIDGET_STRIP_FLOW_DASH}
                    strokeLinecap="round"
                    style={{
                      animation: WIDGET_STRIP_FLOW_ANIMATION,
                    }}
                  />
                )}
                {line.arrow !== "" && <polygon points={line.arrow} fill={drawn.arrowColor} />}
              </g>
            );
          })}
          {drawing.heads.map((head) => (
            <polygon key={head.id} points={head.arrow} fill={headColorOf(head.id)} />
          ))}
        </svg>
        {drawing.turns.map((turn) => {
          const agent = agentOf(turn.place.step.id);
          const standing = standingOf(turn.place.step.id);
          const color = agent?.color ?? WIDGET_STRIP_REST_COLOR;
          const ringColor = standing === "failed" ? WIDGET_FAILURE_COLOR : color;
          const isRinged = standing === "working" || standing === "failed";
          const opacity = standing === "waiting" ? WIDGET_CELL_DIM_OPACITY : 1;

          return (
            <div key={turn.place.step.id}>
              {isRinged && (
                <span
                  className="position-absolute"
                  style={{
                    left: turn.at.x - RADIUS_PX - WIDGET_STRIP_RING_AIR_PX,
                    top: turn.at.y - RADIUS_PX - WIDGET_STRIP_RING_AIR_PX,
                    width: WIDGET_CAROUSEL_SPHERE_PX + 2 * WIDGET_STRIP_RING_AIR_PX,
                    height: WIDGET_CAROUSEL_SPHERE_PX + 2 * WIDGET_STRIP_RING_AIR_PX,
                    borderRadius: "50%",
                    border:
                      standing === "failed"
                        ? `${WIDGET_STRIP_FAILED_RING_WIDTH_PX}px solid ${WIDGET_FAILURE_COLOR}`
                        : `1px solid ${mixWithTransparent(color, WIDGET_STRIP_RING_BORDER_PERCENT)}`,
                    boxShadow: `0 0 ${WIDGET_STRIP_RING_GLOW_PX}px ${mixWithTransparent(
                      ringColor,
                      standing === "failed" ? WIDGET_STRIP_FAILED_GLOW_PERCENT : WIDGET_STRIP_RING_GLOW_PERCENT,
                    )}`,
                  }}
                />
              )}
              <span
                className="position-absolute"
                style={{
                  left: turn.at.x - RADIUS_PX,
                  top: turn.at.y - RADIUS_PX,
                  opacity,
                }}
              >
                <WidgetSphere
                  color={standing === "failed" ? WIDGET_FAILURE_COLOR : color}
                  isActive
                  isChosen={standing === "working"}
                  sizePx={WIDGET_CAROUSEL_SPHERE_PX}
                />
              </span>
              <span
                className="position-absolute font-monospace text-uppercase text-truncate text-center"
                style={{
                  left: turn.at.x - WIDGET_STRIP_NAME_WIDTH_PX / 2,
                  top: turn.at.y + RADIUS_PX + WIDGET_STRIP_NAME_TOP_PX,
                  width: WIDGET_STRIP_NAME_WIDTH_PX,
                  color: standing === "failed" ? WIDGET_FAILURE_COLOR : color,
                  fontSize: WIDGET_CAROUSEL_NAME_FONT_SIZE_PX,
                  letterSpacing: WIDGET_CAROUSEL_NAME_LETTER_SPACING_PX,
                  opacity,
                }}
              >
                {agent?.name ?? ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
