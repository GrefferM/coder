import { ConfirmDialog, Mark } from "../../../../components";
import {
  FILE_CONFLICT_COLUMNS_GAP_PX,
  FILE_CONFLICT_COLUMN_BACKGROUND_COLOR,
  FILE_CONFLICT_COLUMN_BORDER_RADIUS_PX,
  FILE_CONFLICT_COLUMN_GAP_PX,
  FILE_CONFLICT_COLUMN_PADDING,
  FILE_CONFLICT_DISK_LABEL,
  FILE_CONFLICT_KEEP_LABEL,
  FILE_CONFLICT_KEEP_NOTE,
  FILE_CONFLICT_LABEL_COLOR,
  FILE_CONFLICT_LINE_COLOR,
  FILE_CONFLICT_LINE_FONT_SIZE_PX,
  FILE_CONFLICT_MINE_LABEL,
  FILE_CONFLICT_NOTE,
  FILE_CONFLICT_NOTE_COLOR,
  FILE_CONFLICT_NOTE_FONT_SIZE_PX,
  FILE_CONFLICT_NOTE_LINE_HEIGHT,
  FILE_CONFLICT_NOTHING_LABEL,
  FILE_CONFLICT_QUESTION,
  FILE_CONFLICT_TAKE_LABEL,
} from "./constants";
import type { FileConflictConfirmProps } from "./interfaces";

/** File changed under a draft, both sides shown. */
export function FileConflictConfirm({ mine, onDisk, onKeep, onTake }: FileConflictConfirmProps) {
  return (
    <ConfirmDialog
      tone="calm"
      question={FILE_CONFLICT_QUESTION}
      noLabel={FILE_CONFLICT_KEEP_LABEL}
      yesLabel={FILE_CONFLICT_TAKE_LABEL}
      onConfirm={onTake}
      onDecline={onKeep}
      onDismiss={onKeep}
    >
      <span
        style={{
          color: FILE_CONFLICT_NOTE_COLOR,
          fontSize: FILE_CONFLICT_NOTE_FONT_SIZE_PX,
          lineHeight: FILE_CONFLICT_NOTE_LINE_HEIGHT,
        }}
      >
        {FILE_CONFLICT_NOTE}
      </span>

      <div
        className="d-flex"
        style={{
          gap: FILE_CONFLICT_COLUMNS_GAP_PX,
        }}
      >
        {[
          {
            label: FILE_CONFLICT_MINE_LABEL,
            lines: mine,
          },
          {
            label: FILE_CONFLICT_DISK_LABEL,
            lines: onDisk,
          },
        ].map((side) => (
          <div
            key={side.label}
            className="d-flex flex-column flex-fill"
            style={{
              gap: FILE_CONFLICT_COLUMN_GAP_PX,
              padding: FILE_CONFLICT_COLUMN_PADDING,
              borderRadius: FILE_CONFLICT_COLUMN_BORDER_RADIUS_PX,
              background: FILE_CONFLICT_COLUMN_BACKGROUND_COLOR,
            }}
          >
            <Mark color={FILE_CONFLICT_LABEL_COLOR} isUpperCase={false}>
              {side.label}
            </Mark>
            {(side.lines.length === 0 ? [FILE_CONFLICT_NOTHING_LABEL] : side.lines).map((line) => (
              <span
                key={line}
                className="font-monospace"
                style={{
                  color: FILE_CONFLICT_LINE_COLOR,
                  fontSize: FILE_CONFLICT_LINE_FONT_SIZE_PX,
                }}
              >
                {line}
              </span>
            ))}
          </div>
        ))}
      </div>

      <span
        style={{
          color: FILE_CONFLICT_NOTE_COLOR,
          fontSize: FILE_CONFLICT_NOTE_FONT_SIZE_PX,
          lineHeight: FILE_CONFLICT_NOTE_LINE_HEIGHT,
        }}
      >
        {FILE_CONFLICT_KEEP_NOTE}
      </span>
    </ConfirmDialog>
  );
}
