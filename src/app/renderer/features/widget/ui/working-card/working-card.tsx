import { useElapsed } from "../../../../hooks";
import { WorkingDots } from "../../../../components";
import {
  WIDGET_BORDER_COLOR,
  WIDGET_CARD_BACKGROUND_COLOR,
  WIDGET_CARD_BORDER_RADIUS_PX,
  WIDGET_PERSON_COLOR,
  WIDGET_WORKING_DOT_PX,
  WIDGET_WORKING_FONT_SIZE_PX,
  WIDGET_WORKING_GAP_PX,
  WIDGET_WORKING_LETTER_SPACING_PX,
  WIDGET_WORKING_PADDING_PX,
  WORKING_LABEL,
} from "../../constants";
import type { WorkingCardProps } from "../../interfaces";

/** A turn still out (52e, 4b): the agent's dots and how long it has been working. */
export function WorkingCard({ color, startedAt }: WorkingCardProps) {
  const elapsed = useElapsed(startedAt);

  return (
    <div
      className="d-flex align-items-center"
      style={{
        padding: WIDGET_WORKING_PADDING_PX,
        gap: WIDGET_WORKING_GAP_PX,
        borderRadius: WIDGET_CARD_BORDER_RADIUS_PX,
        border: `1px solid ${WIDGET_BORDER_COLOR}`,
        background: WIDGET_CARD_BACKGROUND_COLOR,
      }}
    >
      <WorkingDots color={color} size={WIDGET_WORKING_DOT_PX} />
      <span
        className="font-monospace text-uppercase"
        style={{
          color: WIDGET_PERSON_COLOR,
          fontSize: WIDGET_WORKING_FONT_SIZE_PX,
          letterSpacing: WIDGET_WORKING_LETTER_SPACING_PX,
        }}
      >{`${WORKING_LABEL}${elapsed}`}</span>
    </div>
  );
}
