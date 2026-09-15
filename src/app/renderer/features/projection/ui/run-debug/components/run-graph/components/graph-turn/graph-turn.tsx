import { SPHERE_SIZE_PX } from "../../../../../../../../components/sphere/constants";
import { Sphere } from "../../../../../../../../components";
import { mixWithTransparent } from "../../../../../../../../utils/colors";
import { spanLabel } from "../../../../../../../../utils/dates";
import { WALK_SPHERE_RADIUS_PX } from "../../../../../../logic";
import { WALK_SPHERE_SCALE } from "../../../../../../constants";
import {
  RUN_GRAPH_NUMBER_BACKGROUND_COLOR,
  RUN_GRAPH_NUMBER_BORDER_COLOR,
  RUN_GRAPH_NUMBER_COLOR,
  RUN_GRAPH_NUMBER_FONT_SIZE_PX,
  RUN_GRAPH_NUMBER_RISE_PX,
  RUN_GRAPH_NUMBER_SIZE_PX,
  RUN_GRAPH_RING_GAP_PX,
  RUN_GRAPH_RING_GLOW_PERCENT,
  RUN_GRAPH_RING_GLOW_PX,
} from "../../constants";
import { StandingPill } from "../standing-pill";
import type { GraphTurnProps } from "./interfaces";

const NUMBER_HALF_PX = RUN_GRAPH_NUMBER_SIZE_PX / 2;
const RING_RADIUS_PX = WALK_SPHERE_RADIUS_PX + RUN_GRAPH_RING_GAP_PX;

/**
 * One turn of the pass — its sphere, named by the agent and by how long the turn took, and its number over
 * the rim. A sphere here is a step, not an agent: one that worked twice stands twice. The sphere opens the
 * step, and the open one wears a ring in its own colour outside its rim.
 */
export function GraphTurn({ turn, standing, isOpen, onOpen }: GraphTurnProps) {
  return (
    <div>
      {isOpen && (
        <div
          className="rounded-circle"
          style={{
            position: "absolute",
            left: turn.at.x - RING_RADIUS_PX,
            top: turn.at.y - RING_RADIUS_PX,
            width: RING_RADIUS_PX * 2,
            height: RING_RADIUS_PX * 2,
            border: `1px solid ${turn.place.step.agentColor}`,
            boxShadow: `0 0 ${RUN_GRAPH_RING_GLOW_PX}px ${mixWithTransparent(turn.place.step.agentColor, RUN_GRAPH_RING_GLOW_PERCENT)}`,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: turn.at.x - SPHERE_SIZE_PX / 2,
          top: turn.at.y - SPHERE_SIZE_PX / 2,
          transform: `scale(${WALK_SPHERE_SCALE})`,
        }}
      >
        <Sphere
          name={turn.place.step.agentName}
          modelTitle={spanLabel(turn.place.step.endedAt.getTime() - turn.place.step.startedAt.getTime())}
          color={turn.place.step.agentColor}
          isActive
          isSelected={isOpen}
          // The pill stands here and never on the step's card — one thing on one screen is said once.
          underLabel={standing === null ? null : <StandingPill standing={standing} />}
          onSelect={onOpen}
        />
      </div>
      <div
        className="d-flex align-items-center justify-content-center font-monospace rounded-circle"
        style={{
          position: "absolute",
          left: turn.at.x - NUMBER_HALF_PX,
          top: turn.at.y - WALK_SPHERE_RADIUS_PX - RUN_GRAPH_NUMBER_RISE_PX,
          width: RUN_GRAPH_NUMBER_SIZE_PX,
          height: RUN_GRAPH_NUMBER_SIZE_PX,
          background: RUN_GRAPH_NUMBER_BACKGROUND_COLOR,
          border: `1px solid ${RUN_GRAPH_NUMBER_BORDER_COLOR}`,
          color: RUN_GRAPH_NUMBER_COLOR,
          fontSize: RUN_GRAPH_NUMBER_FONT_SIZE_PX,
        }}
      >
        {turn.place.number}
      </div>
    </div>
  );
}
