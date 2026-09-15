import { useElapsed } from "../../../../../../hooks";
import { CallRow } from "../call-row";
import {
  WORK_CARD_BACKGROUND_COLOR,
  WORK_CARD_BAR_CYCLE_MS,
  WORK_CARD_BAR_HEIGHT_PX,
  WORK_CARD_BAR_TRACK_COLOR,
  WORK_CARD_BAR_WIDTH_PERCENT,
  WORK_CARD_BORDER_COLOR,
  WORK_CARD_BORDER_RADIUS_PX,
  WORK_CARD_DOT_SIZE_PX,
  WORK_CARD_GAP_PX,
  WORK_CARD_LABEL,
  WORK_CARD_LABEL_COLOR,
  WORK_CARD_LABEL_FONT_SIZE_PX,
  WORK_CARD_LABEL_SEPARATOR,
  WORK_CARD_PADDING,
} from "./constants";
import { Mark, WorkingDots } from "../../../../../../components";
import type { WorkCardProps } from "./interfaces";

/** The running turn and its elapsed time. */
export function WorkCard({ agentColor, startedAt, calls, openCalls }: WorkCardProps) {
  const elapsed = useElapsed(startedAt);

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: WORK_CARD_GAP_PX,
        padding: WORK_CARD_PADDING,
        borderRadius: WORK_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${WORK_CARD_BORDER_COLOR}`,
        background: WORK_CARD_BACKGROUND_COLOR,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: WORK_CARD_GAP_PX,
        }}
      >
        <WorkingDots color={agentColor} size={WORK_CARD_DOT_SIZE_PX} />
        <Mark color={WORK_CARD_LABEL_COLOR} size={WORK_CARD_LABEL_FONT_SIZE_PX} className="flex-fill">
          {`${WORK_CARD_LABEL}${WORK_CARD_LABEL_SEPARATOR}${elapsed}`}
        </Mark>
      </div>
      <div
        style={{
          height: WORK_CARD_BAR_HEIGHT_PX,
          borderRadius: WORK_CARD_BAR_HEIGHT_PX,
          background: WORK_CARD_BAR_TRACK_COLOR,
          overflow: "hidden",
        }}
      >
        <div
          className="work-bar"
          style={{
            width: `${WORK_CARD_BAR_WIDTH_PERCENT}%`,
            height: "100%",
            background: agentColor,
            animationDuration: `${WORK_CARD_BAR_CYCLE_MS}ms`,
          }}
        />
      </div>
      {calls.map((call) => (
        <CallRow key={call.id} call={call} agentColor={agentColor} openCalls={openCalls} />
      ))}
    </div>
  );
}
