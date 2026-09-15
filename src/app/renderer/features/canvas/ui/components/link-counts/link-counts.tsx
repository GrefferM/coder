import { ukrainianPlural } from "../../../../../utils/text";
import { CANVAS_LAYER } from "../../../../../constants";
import {
  LINK_COUNTS_BACKGROUND_COLOR,
  LINK_COUNTS_BORDER_COLOR,
  LINK_COUNTS_BORDER_RADIUS_PX,
  LINK_COUNTS_FONT_SIZE_PX,
  LINK_COUNTS_GAP_PX,
  LINK_COUNTS_INCOMING_COLOR,
  LINK_COUNTS_INCOMING_FORMS,
  LINK_COUNTS_INCOMING_SAMPLE_WIDTH,
  LINK_COUNTS_LEFT_PX,
  LINK_COUNTS_LETTER_SPACING_PX,
  LINK_COUNTS_OUTGOING_COLOR,
  LINK_COUNTS_OUTGOING_FORMS,
  LINK_COUNTS_OUTGOING_SAMPLE_WIDTH,
  LINK_COUNTS_PADDING,
  LINK_COUNTS_ROW_GAP_PX,
  LINK_COUNTS_TOP_PX,
} from "./constants";
import type { LinkCountsProps } from "./interfaces";
import { Sample } from "./components";

/** Link counts — outgoing in the agent's colour, incoming neutral; an empty direction is omitted. */
export function LinkCounts({ outgoing, incoming, color }: LinkCountsProps) {
  const [outgoingOne, outgoingFew, outgoingMany] = LINK_COUNTS_OUTGOING_FORMS;
  const [incomingOne, incomingFew, incomingMany] = LINK_COUNTS_INCOMING_FORMS;

  return (
    <div
      className="d-flex flex-column font-monospace text-uppercase"
      style={{
        position: "absolute",
        left: LINK_COUNTS_LEFT_PX,
        top: LINK_COUNTS_TOP_PX,
        zIndex: CANVAS_LAYER,
        gap: LINK_COUNTS_GAP_PX,
        padding: LINK_COUNTS_PADDING,
        borderRadius: LINK_COUNTS_BORDER_RADIUS_PX,
        border: `1px solid ${LINK_COUNTS_BORDER_COLOR}`,
        background: LINK_COUNTS_BACKGROUND_COLOR,
        fontSize: LINK_COUNTS_FONT_SIZE_PX,
        letterSpacing: LINK_COUNTS_LETTER_SPACING_PX,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {outgoing > 0 && (
        <span
          className="d-flex align-items-center"
          style={{
            gap: LINK_COUNTS_ROW_GAP_PX,
            color: LINK_COUNTS_OUTGOING_COLOR,
          }}
        >
          <Sample color={color} width={LINK_COUNTS_OUTGOING_SAMPLE_WIDTH} />
          {`${outgoing} ${ukrainianPlural(outgoing, outgoingOne, outgoingFew, outgoingMany)}`}
        </span>
      )}
      {incoming > 0 && (
        <span
          className="d-flex align-items-center"
          style={{
            gap: LINK_COUNTS_ROW_GAP_PX,
            color: LINK_COUNTS_INCOMING_COLOR,
          }}
        >
          <Sample color={LINK_COUNTS_INCOMING_COLOR} width={LINK_COUNTS_INCOMING_SAMPLE_WIDTH} />
          {`${incoming} ${ukrainianPlural(incoming, incomingOne, incomingFew, incomingMany)}`}
        </span>
      )}
    </div>
  );
}
