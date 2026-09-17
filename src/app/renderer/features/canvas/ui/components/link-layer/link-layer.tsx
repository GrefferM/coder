import { SPHERE_SIZE_PX } from "../../../../../components/sphere/constants";
import { linkLine } from "../../../../links";
import { mixWithTransparent } from "../../../../../utils/colors";
import {
  CANVAS_LINK_ARROW_COLOR,
  CANVAS_LINK_AWAITED_DASH,
  CANVAS_LINK_LIVE_DRIFT_OPACITY,
  CANVAS_LINK_LIVE_PERCENT,
  CANVAS_LINK_SILENT_COLOR,
  CANVAS_LINK_COLOR,
  CANVAS_LINK_DRAGGED_ARROW_COLOR,
  CANVAS_LINK_DRAGGED_COLOR,
  CANVAS_LINK_DOOMED_COLOR,
  CANVAS_LINK_DOOMED_DASH,
  CANVAS_LINK_DOOMED_OPACITY,
  CANVAS_LINK_DRAGGED_DASH,
  CANVAS_LINK_DRIFT_COLOR,
  CANVAS_LINK_DRIFT_DASH,
  CANVAS_LINK_DRIFT_DURATION,
  CANVAS_LINK_FLOW_DASH,
  CANVAS_LINK_FLOW_DURATION,
  CANVAS_LINK_FLOW_OPACITY,
  CANVAS_LINK_FLOW_WIDTH,
  CANVAS_LINK_DRIFT_OPACITY,
  CANVAS_LINK_DRIFT_WIDTH,
  CANVAS_LINK_HANDLE_FILL,
  CANVAS_LINK_HANDLE_SIZE_PX,
  CANVAS_LINK_HANDLE_WIDTH,
  CANVAS_LINK_HIT_WIDTH,
  CANVAS_LINK_SELECTED_DRIFT_OPACITY,
  CANVAS_LINK_SELECTED_DRIFT_WIDTH,
  CANVAS_LINK_SELECTED_GLOW_PERCENT,
  CANVAS_LINK_SELECTED_GLOW_WIDTH,
  CANVAS_LINK_SELECTED_PERCENT,
  CANVAS_LINK_SELECTED_WIDTH,
  CANVAS_LINK_WIDTH,
} from "../../../constants";
import type { LinkLayerProps } from "./interfaces";

const SPHERE_RADIUS_PX = SPHERE_SIZE_PX / 2;
const HANDLE_OFFSET_PX = CANVAS_LINK_HANDLE_SIZE_PX / 2;

/** Every link, drawn under the spheres and toned by the state of its ends; a wide invisible stroke takes clicks. */
export function LinkLayer({
  links,
  linkLives,
  agents,
  deadEnds,
  selectedAgentId,
  selectedLinkId,
  doomedAgentId,
  draggedAgentId,
  draggedAt,
  onSelectLink,
}: LinkLayerProps) {
  /** Where one end of a line stands — the agent, the point it is being dragged to, or its dead place (50a). */
  function placeOf(agentId: string) {
    if (agentId === draggedAgentId && draggedAt) {
      return draggedAt;
    }

    return agents.find((agent) => agent.id === agentId) ?? deadEnds[agentId];
  }

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      {links.map((link) => {
        const from = placeOf(link.from);
        const to = placeOf(link.to);

        if (!from || !to) {
          return null;
        }

        const line = linkLine(from, to, SPHERE_RADIUS_PX);
        const isDragged = link.from === draggedAgentId || link.to === draggedAgentId;
        const isSelected = link.id === selectedLinkId;
        const isDoomed = link.from === doomedAgentId || link.to === doomedAgentId;
        const isLit = !isDoomed && (isSelected || link.from === selectedAgentId);
        // What this line is doing — flowing, awaited, answered or silent.
        const life = isDoomed ? null : (linkLives[link.id] ?? null);
        const isRunning = life === "running";
        const isAwaited = life === "awaited";
        const isAnswered = life === "answered";
        const isSilent = life === "silent";
        // A line of the run in hand takes its source's colour, whether its answer is in or still coming.
        const isLive = isAnswered || isAwaited;
        const sourceColor = agents.find((agent) => agent.id === link.from)?.color ?? CANVAS_LINK_COLOR;
        const selectedColor = mixWithTransparent(sourceColor, CANVAS_LINK_SELECTED_PERCENT);

        return (
          <g key={link.id} opacity={isDoomed ? CANVAS_LINK_DOOMED_OPACITY : undefined}>
            {isLit && (
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.stem.x}
                y2={line.stem.y}
                stroke={mixWithTransparent(sourceColor, CANVAS_LINK_SELECTED_GLOW_PERCENT)}
                strokeWidth={CANVAS_LINK_SELECTED_GLOW_WIDTH}
                strokeLinecap="round"
              />
            )}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.stem.x}
              y2={line.stem.y}
              stroke={
                isDoomed
                  ? CANVAS_LINK_DOOMED_COLOR
                  : isLit
                    ? selectedColor
                    : isDragged
                      ? CANVAS_LINK_DRAGGED_COLOR
                      : isLive
                        ? mixWithTransparent(sourceColor, CANVAS_LINK_LIVE_PERCENT)
                        : isSilent
                          ? CANVAS_LINK_SILENT_COLOR
                          : CANVAS_LINK_COLOR
              }
              strokeWidth={isLit ? CANVAS_LINK_SELECTED_WIDTH : CANVAS_LINK_WIDTH}
              strokeDasharray={
                isDoomed
                  ? CANVAS_LINK_DOOMED_DASH
                  : isDragged && !isLit
                    ? CANVAS_LINK_DRAGGED_DASH
                    : isAwaited || isSilent
                      ? CANVAS_LINK_AWAITED_DASH
                      : undefined
              }
              strokeLinecap="round"
            />
            {!isDoomed && (!isDragged || isLit) && (
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.stem.x}
                y2={line.stem.y}
                stroke={isRunning || isLit || isLive ? sourceColor : CANVAS_LINK_DRIFT_COLOR}
                strokeWidth={
                  isRunning
                    ? CANVAS_LINK_FLOW_WIDTH
                    : isLit
                      ? CANVAS_LINK_SELECTED_DRIFT_WIDTH
                      : CANVAS_LINK_DRIFT_WIDTH
                }
                strokeDasharray={isRunning ? CANVAS_LINK_FLOW_DASH : CANVAS_LINK_DRIFT_DASH}
                strokeLinecap="round"
                opacity={
                  isRunning
                    ? CANVAS_LINK_FLOW_OPACITY
                    : isLit
                      ? CANVAS_LINK_SELECTED_DRIFT_OPACITY
                      : isLive
                        ? CANVAS_LINK_LIVE_DRIFT_OPACITY
                        : CANVAS_LINK_DRIFT_OPACITY
                }
                style={{
                  animation: `edge-flow ${isRunning ? CANVAS_LINK_FLOW_DURATION : CANVAS_LINK_DRIFT_DURATION} linear infinite`,
                }}
              />
            )}
            <polygon
              points={line.arrow}
              fill={
                isDoomed
                  ? CANVAS_LINK_DOOMED_COLOR
                  : isLit
                    ? sourceColor
                    : isDragged
                      ? CANVAS_LINK_DRAGGED_ARROW_COLOR
                      : isLive
                        ? sourceColor
                        : isSilent
                          ? CANVAS_LINK_SILENT_COLOR
                          : CANVAS_LINK_ARROW_COLOR
              }
            />
            {isSelected && (
              <rect
                x={line.middle.x - HANDLE_OFFSET_PX}
                y={line.middle.y - HANDLE_OFFSET_PX}
                width={CANVAS_LINK_HANDLE_SIZE_PX}
                height={CANVAS_LINK_HANDLE_SIZE_PX}
                fill={CANVAS_LINK_HANDLE_FILL}
                stroke={selectedColor}
                strokeWidth={CANVAS_LINK_HANDLE_WIDTH}
              />
            )}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="transparent"
              strokeWidth={CANVAS_LINK_HIT_WIDTH}
              // The line's own click, kept from the canvas behind it.
              onClick={(event) => {
                event.stopPropagation();
                onSelectLink(link.id);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              style={{
                pointerEvents: "stroke",
                cursor: "pointer",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
