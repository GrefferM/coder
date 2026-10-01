import {
  NOT_STARTED_ENDS,
  NOT_STARTED_DRAFT_NOTE,
  NOT_STARTED_FREE_LABEL,
  NOT_STARTED_TITLE,
  OVER_CEILING_ASKED_LABEL,
  OVER_CEILING_CEILING_LABEL,
  OVER_CEILING_MEMORY_LABEL,
  OVER_CEILING_NO_RETRY_NOTE,
  OVER_CEILING_PROMPT_LABEL,
  OVER_CEILING_TOTAL_LABEL,
} from "../../../../constants";
import { groupedNumber } from "../../../../../../utils/numbers";
import {
  NOT_STARTED_CARD_ACCENT_COLOR,
  NOT_STARTED_CARD_ACT_TONE,
  NOT_STARTED_CARD_BACKGROUND_COLOR,
  NOT_STARTED_CARD_BORDER_COLOR,
  NOT_STARTED_CARD_BORDER_RADIUS_PX,
  NOT_STARTED_CARD_FOOT_GAP_PX,
  NOT_STARTED_CARD_GAP_PX,
  NOT_STARTED_CARD_HEAD_GAP_PX,
  NOT_STARTED_CARD_ICON_SIZE_PX,
  NOT_STARTED_CARD_ICON_WIDTH,
  NOT_STARTED_CARD_PADDING_PX,
  NOT_STARTED_CARD_TITLE_FONT_SIZE_PX,
  NOT_STARTED_CARD_BREAKDOWN_BACKGROUND_COLOR,
  NOT_STARTED_CARD_BREAKDOWN_BORDER_RADIUS_PX,
  NOT_STARTED_CARD_BREAKDOWN_FONT_SIZE_PX,
  NOT_STARTED_CARD_BREAKDOWN_GAP_PX,
  NOT_STARTED_CARD_BREAKDOWN_LABEL_COLOR,
  NOT_STARTED_CARD_BREAKDOWN_PADDING,
  NOT_STARTED_CARD_BREAKDOWN_ROW_GAP_PX,
  NOT_STARTED_CARD_BREAKDOWN_VALUE_COLOR,
  NOT_STARTED_CARD_NO_RETRY_LINE_HEIGHT,
  NOT_STARTED_CARD_SUM_BORDER,
  NOT_STARTED_CARD_SUM_LABEL_COLOR,
  NOT_STARTED_CARD_SUM_PADDING_PX,
} from "./constants";
import { Mark, TextButton, Words } from "../../../../../../components";
import { AGENT_CHAT_FOUND_EDGE, AGENT_CHAT_FOUND_EDGE_GONE, AGENT_CHAT_FOUND_FADE } from "../../constants";
import type { CeilingRow, NotStartedCardProps } from "./interfaces";

/** A turn that never began: shared heading, the reason's word, and the act. */
export function NotStartedCard({ reason, note, wouldGo, isAsked, onAct, isFound }: NotStartedCardProps) {
  const card = NOT_STARTED_ENDS[reason];
  // A ceiling refusal explains why there is no retry; other reasons say the words are back in the field.
  const under = wouldGo === null ? (isAsked ? NOT_STARTED_DRAFT_NOTE : null) : OVER_CEILING_NO_RETRY_NOTE;
  /** The breakdown's lines, in the order they add up. */
  const rows: CeilingRow[] =
    wouldGo === null
      ? []
      : [
          {
            label: OVER_CEILING_PROMPT_LABEL,
            count: wouldGo.prompt,
          },
          {
            label: OVER_CEILING_ASKED_LABEL,
            count: wouldGo.asked,
          },
          {
            label: OVER_CEILING_MEMORY_LABEL,
            count: wouldGo.memory,
          },
        ];

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: NOT_STARTED_CARD_GAP_PX,
        padding: NOT_STARTED_CARD_PADDING_PX,
        borderRadius: NOT_STARTED_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${NOT_STARTED_CARD_BORDER_COLOR}`,
        // Highlights where the search stopped, then fades.
        boxShadow: isFound === true ? AGENT_CHAT_FOUND_EDGE : AGENT_CHAT_FOUND_EDGE_GONE,
        transition: AGENT_CHAT_FOUND_FADE,
        background: NOT_STARTED_CARD_BACKGROUND_COLOR,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: NOT_STARTED_CARD_HEAD_GAP_PX,
        }}
      >
        <svg
          width={NOT_STARTED_CARD_ICON_SIZE_PX}
          height={NOT_STARTED_CARD_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={NOT_STARTED_CARD_ACCENT_COLOR}
          strokeWidth={NOT_STARTED_CARD_ICON_WIDTH}
          strokeLinecap="round"
          style={{
            flexShrink: 0,
          }}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5h.01" />
        </svg>
        <span
          className="flex-fill"
          style={{
            color: NOT_STARTED_CARD_ACCENT_COLOR,
            fontSize: NOT_STARTED_CARD_TITLE_FONT_SIZE_PX,
            fontWeight: 600,
          }}
        >
          {NOT_STARTED_TITLE}
        </span>
        <Mark color={NOT_STARTED_CARD_ACCENT_COLOR}>{card.label}</Mark>
      </div>
      <Words>{note}</Words>
      {wouldGo !== null && (
        <div
          className="d-flex flex-column"
          style={{
            gap: NOT_STARTED_CARD_BREAKDOWN_GAP_PX,
            padding: NOT_STARTED_CARD_BREAKDOWN_PADDING,
            borderRadius: NOT_STARTED_CARD_BREAKDOWN_BORDER_RADIUS_PX,
            background: NOT_STARTED_CARD_BREAKDOWN_BACKGROUND_COLOR,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className="d-flex font-monospace"
              style={{
                gap: NOT_STARTED_CARD_BREAKDOWN_ROW_GAP_PX,
                color: NOT_STARTED_CARD_BREAKDOWN_VALUE_COLOR,
                fontSize: NOT_STARTED_CARD_BREAKDOWN_FONT_SIZE_PX,
              }}
            >
              <span
                className="flex-fill"
                style={{
                  color: NOT_STARTED_CARD_BREAKDOWN_LABEL_COLOR,
                }}
              >
                {row.label}
              </span>
              {groupedNumber(row.count)}
            </div>
          ))}
          <div
            className="d-flex font-monospace"
            style={{
              gap: NOT_STARTED_CARD_BREAKDOWN_ROW_GAP_PX,
              paddingTop: NOT_STARTED_CARD_SUM_PADDING_PX,
              borderTop: NOT_STARTED_CARD_SUM_BORDER,
              color: NOT_STARTED_CARD_ACCENT_COLOR,
              fontSize: NOT_STARTED_CARD_BREAKDOWN_FONT_SIZE_PX,
            }}
          >
            <span
              className="flex-fill"
              style={{
                color: NOT_STARTED_CARD_SUM_LABEL_COLOR,
              }}
            >
              {OVER_CEILING_TOTAL_LABEL}
            </span>
            {groupedNumber(wouldGo.total)}
          </div>
          <div
            className="d-flex font-monospace"
            style={{
              gap: NOT_STARTED_CARD_BREAKDOWN_ROW_GAP_PX,
              color: NOT_STARTED_CARD_BREAKDOWN_VALUE_COLOR,
              fontSize: NOT_STARTED_CARD_BREAKDOWN_FONT_SIZE_PX,
            }}
          >
            <span
              className="flex-fill"
              style={{
                color: NOT_STARTED_CARD_SUM_LABEL_COLOR,
              }}
            >
              {OVER_CEILING_CEILING_LABEL}
            </span>
            {/* A ceiling is the person's own number, shown as written and ungrouped. */}
            {wouldGo.ceiling}
          </div>
        </div>
      )}
      <div
        className="d-flex align-items-center"
        style={{
          gap: NOT_STARTED_CARD_FOOT_GAP_PX,
        }}
      >
        <Mark className="flex-fill">{NOT_STARTED_FREE_LABEL}</Mark>
        {onAct !== null && (
          <TextButton tone={NOT_STARTED_CARD_ACT_TONE} onPress={onAct}>
            {card.actLabel}
          </TextButton>
        )}
      </div>
      {under !== null && <Mark lineHeight={NOT_STARTED_CARD_NO_RETRY_LINE_HEIGHT}>{under}</Mark>}
    </div>
  );
}
