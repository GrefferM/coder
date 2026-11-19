import { mixWithTransparent } from "../../../../utils/colors";
import { MARK_FONT_SIZE_PX } from "../../../../constants";
import { onwardCount } from "../../logic";
import { WidgetSphere } from "../widget-sphere";
import {
  ONWARD_PREFIX,
  WIDGET_HALO_CORE_PERCENT,
  WIDGET_HALO_EDGE_PERCENT,
  WIDGET_HALO_EDGE_STOP_PERCENT,
  WIDGET_HALO_END_STOP_PERCENT,
  WIDGET_HALO_LOUD_SCALE,
  WIDGET_HALO_QUIET_OPACITY,
  WIDGET_HALO_QUIET_SCALE,
  WIDGET_HALO_RISE_MS,
  WIDGET_HALO_SCALE,
  WIDGET_HALO_SHIMMER_OPACITY,
  WIDGET_ONWARD_COLOR,
  WIDGET_ONWARD_LETTER_SPACING_PX,
  WIDGET_STAGE_LINES_GAP_PX,
  WIDGET_STAGE_NAME_FONT_SIZE_PX,
  WIDGET_STAGE_NAME_GAP_PX,
  WIDGET_STAGE_NAME_LETTER_SPACING_PX,
  WIDGET_STAGE_PADDING,
  WIDGET_STAGE_SPHERE_PX,
} from "../../constants";
import type { SphereStageProps } from "../../interfaces";

/**
 * The chosen agent as one big sphere (52a), its name and «→ N» under it. Its halo follows the microphone's loudness
 * while it records (52d) and shimmers while a walk is out or an end is read (52e, 52f).
 */
export function SphereStage({ agent, links, level, isShimmering }: SphereStageProps) {
  const color = agent?.color ?? WIDGET_ONWARD_COLOR;
  const isHaloShown = agent !== null && (level !== null || isShimmering);
  const loudness = level ?? 0;
  const onward = agent === null ? 0 : onwardCount(agent.id, links);

  return (
    <div
      className="d-flex flex-column align-items-center flex-shrink-0"
      style={{
        padding: WIDGET_STAGE_PADDING,
      }}
    >
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          width: WIDGET_STAGE_SPHERE_PX,
          height: WIDGET_STAGE_SPHERE_PX,
        }}
      >
        {isHaloShown && (
          <div
            className={level === null ? "widget-shimmer" : undefined}
            style={{
              position: "absolute",
              width: WIDGET_STAGE_SPHERE_PX * WIDGET_HALO_SCALE,
              height: WIDGET_STAGE_SPHERE_PX * WIDGET_HALO_SCALE,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${mixWithTransparent(color, WIDGET_HALO_CORE_PERCENT)} 0%, ${mixWithTransparent(color, WIDGET_HALO_EDGE_PERCENT)} ${WIDGET_HALO_EDGE_STOP_PERCENT}%, transparent ${WIDGET_HALO_END_STOP_PERCENT}%)`,
              transform:
                level === null
                  ? undefined
                  : `scale(${WIDGET_HALO_QUIET_SCALE + (WIDGET_HALO_LOUD_SCALE - WIDGET_HALO_QUIET_SCALE) * loudness})`,
              opacity:
                level === null
                  ? WIDGET_HALO_SHIMMER_OPACITY
                  : WIDGET_HALO_QUIET_OPACITY + (1 - WIDGET_HALO_QUIET_OPACITY) * loudness,
              transition: `transform ${WIDGET_HALO_RISE_MS}ms, opacity ${WIDGET_HALO_RISE_MS}ms`,
              pointerEvents: "none",
            }}
          />
        )}
        <WidgetSphere color={color} isActive={agent?.isActive ?? false} isChosen sizePx={WIDGET_STAGE_SPHERE_PX} />
      </div>
      {agent !== null && (
        <span
          className="d-flex flex-column align-items-center font-monospace text-uppercase"
          style={{
            marginTop: WIDGET_STAGE_NAME_GAP_PX,
            gap: WIDGET_STAGE_LINES_GAP_PX,
          }}
        >
          <span
            style={{
              color: agent.color,
              fontSize: WIDGET_STAGE_NAME_FONT_SIZE_PX,
              letterSpacing: WIDGET_STAGE_NAME_LETTER_SPACING_PX,
            }}
          >
            {agent.name}
          </span>
          {onward > 0 && (
            <span
              style={{
                color: WIDGET_ONWARD_COLOR,
                fontSize: MARK_FONT_SIZE_PX,
                letterSpacing: WIDGET_ONWARD_LETTER_SPACING_PX,
              }}
            >{`${ONWARD_PREFIX}${onward}`}</span>
          )}
        </span>
      )}
    </div>
  );
}
