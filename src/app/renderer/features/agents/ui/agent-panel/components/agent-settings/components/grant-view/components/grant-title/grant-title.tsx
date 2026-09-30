import {
  GRANT_VIEW_DESCRIPTION_COLOR,
  GRANT_VIEW_DESCRIPTION_FONT_SIZE_PX,
  GRANT_VIEW_DESCRIPTION_LINE_HEIGHT,
  GRANT_VIEW_TITLE_COLOR,
  GRANT_VIEW_TITLE_FONT_SIZE_PX,
  GRANT_VIEW_TITLE_GAP_PX,
} from "../../constants";
import type { GrantTitleProps } from "./interfaces";

/** The function's name and its description. */
export function GrantTitle({ name, description }: GrantTitleProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: GRANT_VIEW_TITLE_GAP_PX,
      }}
    >
      <span
        style={{
          color: GRANT_VIEW_TITLE_COLOR,
          fontSize: GRANT_VIEW_TITLE_FONT_SIZE_PX,
          fontWeight: 600,
        }}
      >
        {name}
      </span>
      <span
        style={{
          color: GRANT_VIEW_DESCRIPTION_COLOR,
          fontSize: GRANT_VIEW_DESCRIPTION_FONT_SIZE_PX,
          lineHeight: GRANT_VIEW_DESCRIPTION_LINE_HEIGHT,
        }}
      >
        {description}
      </span>
    </div>
  );
}
