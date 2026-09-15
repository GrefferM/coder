import {
  RUN_HISTORY_FOOT_GAP_PX,
  RUN_HISTORY_FOOT_LINE_HEIGHT,
  RUN_HISTORY_FOOT_PADDING,
  RUN_HISTORY_FOOT_TOP_PX,
  RUN_HISTORY_NOTE_COLOR,
  RUN_HISTORY_RULE_COLOR,
  RUN_HISTORY_SWEEP_NOTE,
} from "../../constants";
import { Mark } from "../../../../../../components";

/** Two rules under the last row — how long the record lives, and where it lives. */
export function HistoryFoot() {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: RUN_HISTORY_FOOT_GAP_PX,
        padding: RUN_HISTORY_FOOT_PADDING,
        marginTop: RUN_HISTORY_FOOT_TOP_PX,
        borderTop: `1px solid ${RUN_HISTORY_RULE_COLOR}`,
      }}
    >
      <Mark color={RUN_HISTORY_NOTE_COLOR} lineHeight={RUN_HISTORY_FOOT_LINE_HEIGHT} isUpperCase={false}>
        {RUN_HISTORY_SWEEP_NOTE}
      </Mark>
    </div>
  );
}
