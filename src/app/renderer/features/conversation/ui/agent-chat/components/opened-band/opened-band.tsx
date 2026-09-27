import { Dot, Mark, TextButton } from "../../../../../../components";
import { dayLabel, timeLabel } from "../../../../../../utils/dates";
import { RUN_STATE_LABELS } from "../../../../../record";
import {
  AGENT_CHAT_OPENED_BACKGROUND_COLOR,
  AGENT_CHAT_OPENED_DOT_COLORS,
  AGENT_CHAT_OPENED_EXPORT_LABEL,
  AGENT_CHAT_OPENED_EXPORT_TONE,
  AGENT_CHAT_OPENED_DOT_GLOW_PX,
  AGENT_CHAT_OPENED_DOT_SIZE_PX,
  AGENT_CHAT_OPENED_GAP_PX,
  AGENT_CHAT_OPENED_EMPTY_DOT_BORDER,
  AGENT_CHAT_OPENED_LABEL_COLOR,
  AGENT_CHAT_OPENED_PADDING,
  AGENT_CHAT_OPENED_RUNNING_DOT_COLOR,
  AGENT_CHAT_OPENED_WHEN_COLOR,
  AGENT_CHAT_QUIET_FONT_SIZE_PX,
  AGENT_CHAT_QUIET_LETTER_SPACING_PX,
  AGENT_CHAT_RULE_COLOR,
} from "../../constants";
import type { OpenedBandProps } from "./interfaces";

/**
 * The band over the stream — how the flow stands, and when it last spoke, in the same words the row of the
 * history uses (`RUN_STATE_LABELS`): it is the same flow, and nobody should have to translate one naming into the
 * other. One word for every state, with the state left to a dot, says nothing beside a row that names it outright
 * — and «НЕ ПІШОВ» has no colour for a dot to carry.
 */
export function OpenedBand({ head, onExport }: OpenedBandProps) {
  const dotColor = AGENT_CHAT_OPENED_DOT_COLORS[head.state] ?? AGENT_CHAT_OPENED_RUNNING_DOT_COLOR;

  return (
    <div
      className="d-flex align-items-center flex-shrink-0"
      style={{
        gap: AGENT_CHAT_OPENED_GAP_PX,
        padding: AGENT_CHAT_OPENED_PADDING,
        background: AGENT_CHAT_OPENED_BACKGROUND_COLOR,
        borderBottom: `1px solid ${AGENT_CHAT_RULE_COLOR}`,
      }}
    >
      <Dot
        color={dotColor}
        border={dotColor === "transparent" ? AGENT_CHAT_OPENED_EMPTY_DOT_BORDER : undefined}
        size={AGENT_CHAT_OPENED_DOT_SIZE_PX}
        glow={AGENT_CHAT_OPENED_DOT_GLOW_PX}
        className="flex-shrink-0"
      />
      <span
        className="font-monospace text-uppercase"
        style={{
          color: AGENT_CHAT_OPENED_LABEL_COLOR,
          fontSize: AGENT_CHAT_QUIET_FONT_SIZE_PX,
          letterSpacing: AGENT_CHAT_QUIET_LETTER_SPACING_PX,
        }}
      >
        {RUN_STATE_LABELS[head.state] ?? RUN_STATE_LABELS.running}
      </span>
      <Mark color={AGENT_CHAT_OPENED_WHEN_COLOR}>{`${dayLabel(head.at, new Date())} ${timeLabel(head.at)}`}</Mark>
      {/* The band's own act stands on its right, away from how the flow stands on the left. */}
      {onExport !== null && (
        <TextButton className="ms-auto" tone={AGENT_CHAT_OPENED_EXPORT_TONE} onPress={onExport}>
          {AGENT_CHAT_OPENED_EXPORT_LABEL}
        </TextButton>
      )}
    </div>
  );
}
