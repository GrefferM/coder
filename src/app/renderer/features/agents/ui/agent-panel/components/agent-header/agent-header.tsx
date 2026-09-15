import { useElapsed } from "../../../../../../hooks";
import { WorkingDots } from "../../../../../../components";
import { mixWithTransparent, mixWithWhite } from "../../../../../../utils/colors";
import { timeLabel } from "../../../../../../utils/dates";
import { STATE_SEPARATOR } from "../../../../constants";
import {
  AGENT_HEADER_AVATAR_BORDER_RADIUS_PX,
  AGENT_HEADER_AVATAR_GLOW_PERCENT,
  AGENT_HEADER_AVATAR_GLOW_PX,
  AGENT_HEADER_AVATAR_LIGHT_PERCENT,
  AGENT_HEADER_AVATAR_OFF_BACKGROUND_COLOR,
  AGENT_HEADER_AVATAR_OFF_BORDER_COLOR,
  AGENT_HEADER_AVATAR_SIZE_PX,
  AGENT_HEADER_DOT_SIZE_PX,
  AGENT_HEADER_GAP_PX,
  AGENT_HEADER_NAME_GAP_PX,
  AGENT_HEADER_OFF_TITLE_COLOR,
  AGENT_HEADER_SIGN_SIZE_PX,
  AGENT_HEADER_STATUS_GAP_PX,
  AGENT_HEADER_PADDING,
  AGENT_HEADER_STATUS_FONT_SIZE_PX,
  AGENT_HEADER_STATUS_MARK,
  AGENT_HEADER_TITLE_COLOR,
  AGENT_HEADER_TITLE_FONT_SIZE_PX,
} from "./constants";
import type { AgentHeaderProps } from "./interfaces";

/** Agent tab header above the switch, with the state line under the name. */
export function AgentHeader({ name, color, isActive, state, startedAt }: AgentHeaderProps) {
  const clock = useElapsed(startedAt ?? 0);
  const said = state.at === null ? state.label : `${state.label}${STATE_SEPARATOR}${timeLabel(state.at)}`;

  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        padding: AGENT_HEADER_PADDING,
        gap: AGENT_HEADER_GAP_PX,
      }}
    >
      <span
        className="flex-shrink-0"
        style={{
          width: AGENT_HEADER_AVATAR_SIZE_PX,
          height: AGENT_HEADER_AVATAR_SIZE_PX,
          borderRadius: AGENT_HEADER_AVATAR_BORDER_RADIUS_PX,
          background: isActive
            ? `radial-gradient(circle at 35% 30%, ${mixWithWhite(color, AGENT_HEADER_AVATAR_LIGHT_PERCENT)}, ${color})`
            : AGENT_HEADER_AVATAR_OFF_BACKGROUND_COLOR,
          border: isActive ? undefined : `1px solid ${AGENT_HEADER_AVATAR_OFF_BORDER_COLOR}`,
          boxShadow: isActive
            ? `0 0 ${AGENT_HEADER_AVATAR_GLOW_PX}px ${mixWithTransparent(color, AGENT_HEADER_AVATAR_GLOW_PERCENT)}`
            : undefined,
        }}
      />
      <span
        className="d-flex flex-column"
        style={{
          gap: AGENT_HEADER_NAME_GAP_PX,
          minWidth: 0,
        }}
      >
        <span
          className="text-truncate"
          style={{
            color: isActive ? AGENT_HEADER_TITLE_COLOR : AGENT_HEADER_OFF_TITLE_COLOR,
            fontSize: AGENT_HEADER_TITLE_FONT_SIZE_PX,
            fontWeight: 600,
          }}
        >
          {name}
        </span>
        <span
          className="d-flex align-items-center font-monospace"
          style={{
            gap: AGENT_HEADER_STATUS_GAP_PX,
            color: state.color,
            fontSize: AGENT_HEADER_STATUS_FONT_SIZE_PX,
          }}
        >
          {state.mark === "clock" ? (
            <WorkingDots color={state.color} size={AGENT_HEADER_DOT_SIZE_PX} />
          ) : state.mark === "sign" ? (
            <svg
              width={AGENT_HEADER_SIGN_SIZE_PX}
              height={AGENT_HEADER_SIGN_SIZE_PX}
              viewBox="0 0 24 24"
              fill="none"
              stroke={state.color}
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 7.5v5.5M12 16.5h.01" />
            </svg>
          ) : (
            <span>{AGENT_HEADER_STATUS_MARK}</span>
          )}
          <span>{state.mark === "clock" ? `${said}${STATE_SEPARATOR}${clock}` : said}</span>
        </span>
      </span>
    </div>
  );
}
