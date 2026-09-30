import { mixWithTransparent } from "../../../../../../utils/colors";
import {
  WAITING_CARD_BACKGROUND_COLOR,
  WAITING_CARD_BORDER_COLOR,
  WAITING_CARD_BORDER_RADIUS_PX,
  WAITING_CARD_DOT_GAP_PX,
  WAITING_CARD_DOT_PERCENTS,
  WAITING_CARD_DOT_SIZE_PX,
  WAITING_CARD_GAP_PX,
  WAITING_CARD_HEAD_COLOR,
  WAITING_CARD_HEAD_FONT_SIZE_PX,
  WAITING_CARD_HEAD_GAP_PX,
  WAITING_CARD_HEAD_PREFIX,
  WAITING_CARD_HEAD_SEPARATOR,
  WAITING_CARD_MARK_SIZE_PX,
  WAITING_CARD_NAME_SEPARATOR,
  WAITING_CARD_NAME_COLORS,
  WAITING_CARD_NOTE_COLOR,
  WAITING_CARD_NOTE_FONT_SIZE_PX,
  WAITING_CARD_NOTE_LINE_HEIGHT,
  WAITING_CARD_PADDING_PX,
  WAITING_CARD_RING_COLOR,
  WAITING_CARD_RING_WIDTH_PX,
  WAITING_CARD_ROWS_GAP_PX,
  WAITING_CARD_ROW_ASIDE_COLOR,
  WAITING_CARD_ROW_ASIDE_FONT_SIZE_PX,
  WAITING_CARD_ROW_BACKGROUND_COLOR,
  WAITING_CARD_ROW_BORDER_RADIUS_PX,
  WAITING_CARD_ROW_FONT_SIZE_PX,
  WAITING_CARD_ROW_GAP_PX,
  WAITING_CARD_ROW_PADDING,
  WAITING_CARD_SECONDS_SUFFIX,
  WAITING_CARD_SILENT_BAR_HEIGHT_PX,
  WAITING_CARD_SILENT_BAR_WIDTH_PX,
  WAITING_CARD_SILENT_RING_COLOR,
  WAITING_CARD_SILENT_WORD,
  WAITING_CARD_STARTS_END_MANY,
  WAITING_CARD_STARTS_END_ONE,
  WAITING_CARD_STARTS_PREFIX,
  WAITING_CARD_TICK_COLOR,
  WAITING_CARD_TICK_PATH,
  WAITING_CARD_TICK_WIDTH,
  WAITING_CARD_WORKING_WORD,
} from "./constants";
import { Dot, Mark } from "../../../../../../components";
import type { WaitingCardProps } from "./interfaces";

/** Over the chat of an agent holding work: «Відповіли 1 / 2», a row per supplier, what ends the wait. */
export function WaitingCard({ waiting, color, agents }: WaitingCardProps) {
  const nameOf = (agentId: string) => agents.find((agent) => agent.id === agentId)?.name ?? "";
  const answered = waiting.suppliers.filter((supplier) => supplier.state === "answered").length;
  const awaitedNames = waiting.suppliers
    .filter((supplier) => supplier.state === "working")
    .map((supplier) => nameOf(supplier.agentId));

  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: WAITING_CARD_GAP_PX,
        padding: WAITING_CARD_PADDING_PX,
        borderRadius: WAITING_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${WAITING_CARD_BORDER_COLOR}`,
        background: WAITING_CARD_BACKGROUND_COLOR,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: WAITING_CARD_HEAD_GAP_PX,
        }}
      >
        <span
          className="d-flex"
          style={{
            gap: WAITING_CARD_DOT_GAP_PX,
          }}
        >
          {WAITING_CARD_DOT_PERCENTS.map((percent) => (
            <Dot key={percent} color={mixWithTransparent(color, percent)} size={WAITING_CARD_DOT_SIZE_PX} />
          ))}
        </span>
        <Mark color={WAITING_CARD_HEAD_COLOR} size={WAITING_CARD_HEAD_FONT_SIZE_PX} className="flex-fill">
          {`${WAITING_CARD_HEAD_PREFIX} ${answered}${WAITING_CARD_HEAD_SEPARATOR}${waiting.suppliers.length}`}
        </Mark>
      </div>
      <div
        className="d-flex flex-column"
        style={{
          gap: WAITING_CARD_ROWS_GAP_PX,
        }}
      >
        {waiting.suppliers.map((supplier) => (
          <div
            key={supplier.agentId}
            className="d-flex align-items-center"
            style={{
              gap: WAITING_CARD_ROW_GAP_PX,
              padding: WAITING_CARD_ROW_PADDING,
              borderRadius: WAITING_CARD_ROW_BORDER_RADIUS_PX,
              background: WAITING_CARD_ROW_BACKGROUND_COLOR,
            }}
          >
            {supplier.state === "answered" ? (
              <svg
                width={WAITING_CARD_MARK_SIZE_PX}
                height={WAITING_CARD_MARK_SIZE_PX}
                viewBox="0 0 24 24"
                fill="none"
                stroke={WAITING_CARD_TICK_COLOR}
                strokeWidth={WAITING_CARD_TICK_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={WAITING_CARD_TICK_PATH} />
              </svg>
            ) : supplier.state === "working" ? (
              // What has not arrived is dashed.
              <span
                style={{
                  width: WAITING_CARD_MARK_SIZE_PX,
                  height: WAITING_CARD_MARK_SIZE_PX,
                  borderRadius: "50%",
                  border: `${WAITING_CARD_RING_WIDTH_PX}px dashed ${WAITING_CARD_RING_COLOR}`,
                  flexShrink: 0,
                }}
              />
            ) : (
              <span
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: WAITING_CARD_MARK_SIZE_PX,
                  height: WAITING_CARD_MARK_SIZE_PX,
                  borderRadius: "50%",
                  border: `${WAITING_CARD_RING_WIDTH_PX}px solid ${WAITING_CARD_SILENT_RING_COLOR}`,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: WAITING_CARD_SILENT_BAR_WIDTH_PX,
                    height: WAITING_CARD_SILENT_BAR_HEIGHT_PX,
                    background: WAITING_CARD_ROW_ASIDE_COLOR,
                  }}
                />
              </span>
            )}
            <span
              className="flex-fill font-monospace"
              style={{
                fontSize: WAITING_CARD_ROW_FONT_SIZE_PX,
                color: WAITING_CARD_NAME_COLORS[supplier.state],
              }}
            >
              {nameOf(supplier.agentId)}
            </span>
            <span
              className="font-monospace"
              style={{
                fontSize: WAITING_CARD_ROW_ASIDE_FONT_SIZE_PX,
                color: WAITING_CARD_ROW_ASIDE_COLOR,
              }}
            >
              {supplier.state === "answered"
                ? `${supplier.seconds ?? 0}${WAITING_CARD_SECONDS_SUFFIX}`
                : supplier.state === "working"
                  ? WAITING_CARD_WORKING_WORD
                  : WAITING_CARD_SILENT_WORD}
            </span>
          </div>
        ))}
      </div>
      {awaitedNames.length > 0 && (
        <span
          style={{
            fontSize: WAITING_CARD_NOTE_FONT_SIZE_PX,
            lineHeight: WAITING_CARD_NOTE_LINE_HEIGHT,
            color: WAITING_CARD_NOTE_COLOR,
          }}
        >
          {`${WAITING_CARD_STARTS_PREFIX}${awaitedNames.join(WAITING_CARD_NAME_SEPARATOR)}${
            awaitedNames.length === 1 ? WAITING_CARD_STARTS_END_ONE : WAITING_CARD_STARTS_END_MANY
          }`}
        </span>
      )}
    </div>
  );
}
