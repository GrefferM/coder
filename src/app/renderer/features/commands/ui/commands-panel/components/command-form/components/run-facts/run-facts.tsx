import { Mark } from "../../../../../../../../components";
import {
  COMMAND_RUN_FACTS,
  COMMAND_RUN_FACTS_BACKGROUND_COLOR,
  COMMAND_RUN_FACTS_BORDER_COLOR,
  COMMAND_RUN_FACTS_BORDER_RADIUS_PX,
  COMMAND_RUN_FACTS_COLOR,
  COMMAND_RUN_FACTS_FONT_SIZE_PX,
  COMMAND_RUN_FACTS_GAP_PX,
  COMMAND_RUN_FACTS_LABEL,
  COMMAND_RUN_FACTS_LABEL_COLOR,
  COMMAND_RUN_FACTS_LINE_GAP_PX,
  COMMAND_RUN_FACTS_LINE_HEIGHT,
  COMMAND_RUN_FACTS_PADDING,
} from "../../constants";
import type { JSX } from "react";

/** Where responsibility ends, said once under the run line, in a field's own skin because it belongs to the form. */
export function RunFacts(): JSX.Element {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: COMMAND_RUN_FACTS_GAP_PX,
        padding: COMMAND_RUN_FACTS_PADDING,
        borderRadius: COMMAND_RUN_FACTS_BORDER_RADIUS_PX,
        background: COMMAND_RUN_FACTS_BACKGROUND_COLOR,
        border: `1px solid ${COMMAND_RUN_FACTS_BORDER_COLOR}`,
      }}
    >
      <Mark color={COMMAND_RUN_FACTS_LABEL_COLOR} isUpperCase={false}>
        {COMMAND_RUN_FACTS_LABEL}
      </Mark>
      <div
        className="d-flex flex-column"
        style={{
          gap: COMMAND_RUN_FACTS_LINE_GAP_PX,
          color: COMMAND_RUN_FACTS_COLOR,
          fontSize: COMMAND_RUN_FACTS_FONT_SIZE_PX,
          lineHeight: COMMAND_RUN_FACTS_LINE_HEIGHT,
        }}
      >
        {COMMAND_RUN_FACTS.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
    </div>
  );
}
