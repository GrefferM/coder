import { startingCeiling } from "../../../../../../words";
import { BoxedAction } from "../../../../../../../../components";
import {
  SERVER_STARTING_SLOW_AFTER_SECONDS,
  SERVER_STARTING_SLOW_LABEL,
  SERVER_STOP_ASKING_LABEL,
} from "../../../../../../constants";
import {
  SERVER_ROW_CEILING_BORDER_COLOR,
  SERVER_ROW_CEILING_COLOR,
  SERVER_ROW_CEILING_FONT_SIZE_PX,
  SERVER_ROW_CEILING_LETTER_SPACING_PX,
  SERVER_ROW_CEILING_PADDING_TOP_PX,
  SERVER_ROW_GAP_PX,
  SERVER_ROW_SLOW_COLOR,
  SERVER_ROW_SLOW_FONT_SIZE_PX,
  SERVER_ROW_SLOW_LETTER_SPACING_PX,
  SERVER_ROW_SLOW_LINE_HEIGHT,
} from "../../constants";
import type { StartingLinesProps } from "./interfaces";

/**
 * What a row says while being raised, under the name and the clock; no bar.
 *
 * The second line comes on the twentieth second; the ceiling stands for the whole wait, with «СКАСУВАТИ» beside it.
 */
export function StartingLines({ waited, onCancel }: StartingLinesProps) {
  return (
    <>
      {waited >= SERVER_STARTING_SLOW_AFTER_SECONDS && (
        <span
          className="font-monospace text-uppercase"
          style={{
            color: SERVER_ROW_SLOW_COLOR,
            fontSize: SERVER_ROW_SLOW_FONT_SIZE_PX,
            letterSpacing: SERVER_ROW_SLOW_LETTER_SPACING_PX,
            lineHeight: SERVER_ROW_SLOW_LINE_HEIGHT,
          }}
        >
          {SERVER_STARTING_SLOW_LABEL}
        </span>
      )}
      <div
        className="d-flex align-items-center"
        style={{
          gap: SERVER_ROW_GAP_PX,
          borderTop: `1px solid ${SERVER_ROW_CEILING_BORDER_COLOR}`,
          paddingTop: SERVER_ROW_CEILING_PADDING_TOP_PX,
        }}
      >
        <span
          className="font-monospace text-uppercase flex-fill"
          style={{
            color: SERVER_ROW_CEILING_COLOR,
            fontSize: SERVER_ROW_CEILING_FONT_SIZE_PX,
            letterSpacing: SERVER_ROW_CEILING_LETTER_SPACING_PX,
          }}
        >
          {startingCeiling()}
        </span>
        <BoxedAction label={SERVER_STOP_ASKING_LABEL} onPress={onCancel} />
      </div>
    </>
  );
}
