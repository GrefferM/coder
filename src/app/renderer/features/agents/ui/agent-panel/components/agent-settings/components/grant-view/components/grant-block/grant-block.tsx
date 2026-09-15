import {
  GRANT_VIEW_BLOCK_GAP_PX,
  GRANT_VIEW_BLOCK_HEAD_GAP_PX,
  GRANT_VIEW_BLOCK_LABEL_FONT_SIZE_PX,
  GRANT_VIEW_BLOCK_LABEL_LETTER_SPACING_PX,
  GRANT_VIEW_BOX_BORDER_RADIUS_PX,
  GRANT_VIEW_BOX_GAP_PX,
  GRANT_VIEW_BOX_PADDING_PX,
  GRANT_VIEW_OPEN_BORDER_COLOR,
  GRANT_VIEW_PINNED_BORDER_COLOR,
} from "../../constants";
import { Mark } from "../../../../../../../../../../components";
import type { GrantBlockProps } from "./interfaces";

/** One block of the grant — a label with its own mark, and the box of rows under it. */
export function GrantBlock({ color, icon, label, isDashed = false, background, children, note }: GrantBlockProps) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        gap: GRANT_VIEW_BLOCK_GAP_PX,
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          gap: GRANT_VIEW_BLOCK_HEAD_GAP_PX,
        }}
      >
        {icon}
        <Mark
          color={color}
          size={GRANT_VIEW_BLOCK_LABEL_FONT_SIZE_PX}
          spacing={GRANT_VIEW_BLOCK_LABEL_LETTER_SPACING_PX}
          isUpperCase={false}
        >
          {label}
        </Mark>
      </div>
      <div
        className="d-flex flex-column"
        style={{
          gap: GRANT_VIEW_BOX_GAP_PX,
          padding: GRANT_VIEW_BOX_PADDING_PX,
          borderRadius: GRANT_VIEW_BOX_BORDER_RADIUS_PX,
          border: `1px ${isDashed ? "dashed" : "solid"} ${isDashed ? GRANT_VIEW_OPEN_BORDER_COLOR : GRANT_VIEW_PINNED_BORDER_COLOR}`,
          background,
        }}
      >
        {children}
      </div>
      {note}
    </div>
  );
}
