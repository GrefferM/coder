import { Fragment } from "react";
import {
  Chip,
  Hairline,
  LostNote,
  LostRow,
  LostTie,
  LOST_TIE_ROW_NAME_COLOR,
  LOST_TIE_RULE_COLOR,
} from "../../../../../../../../components";
import { TOOLS_SECTION_COUNT_SEPARATOR } from "../tools-section/constants";
import {
  LOST_GRANTS_NOTES,
  LOST_GRANTS_PINNED_BACKGROUND_COLOR,
  LOST_GRANTS_PINNED_GAP_PX,
  LOST_GRANTS_PINNED_ICON_SIZE_PX,
  LOST_GRANTS_REMOVE_LABEL,
  LOST_GRANTS_SOURCE_FONT_SIZE_PX,
  LOST_GRANTS_SOURCE_LETTER_SPACING_PX,
} from "./constants";
import type { LostGrantsProps } from "./interfaces";

/**
 * Grants the project can no longer honour — one group after the working ones, struck
 * through and counted nowhere. Several reasons stand in that one group, each with its own sentence under its own
 * rows, and one act at the end takes the whole group away: two functions of one server are one act, not two.
 */
export function LostGrants({ groups, onRemove }: LostGrantsProps) {
  const count = groups.reduce((all, group) => all + group.rows.length, 0);

  return (
    <LostTie
      removeLabel={
        count > 1 ? `${LOST_GRANTS_REMOVE_LABEL}${TOOLS_SECTION_COUNT_SEPARATOR}${count}` : LOST_GRANTS_REMOVE_LABEL
      }
      onRemove={onRemove}
    >
      {groups.map((group, at) => (
        <Fragment key={group.key}>
          {at > 0 && <Hairline color={LOST_TIE_RULE_COLOR} />}
          {group.rows.map((row) => (
            <LostRow key={row.id} name={row.name}>
              {row.pinnedCount > 0 && (
                <Chip
                  color={LOST_TIE_ROW_NAME_COLOR}
                  background={LOST_GRANTS_PINNED_BACKGROUND_COLOR}
                  gap={LOST_GRANTS_PINNED_GAP_PX}
                  className="text-decoration-line-through"
                >
                  <svg
                    width={LOST_GRANTS_PINNED_ICON_SIZE_PX}
                    height={LOST_GRANTS_PINNED_ICON_SIZE_PX}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={LOST_TIE_ROW_NAME_COLOR}
                    strokeWidth="2.4"
                  >
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  {row.pinnedCount}
                </Chip>
              )}
              {/* Where the server still stands, the row says which one gave this function. */}
              {group.serverName !== null && (
                <span
                  className="font-monospace flex-shrink-0"
                  style={{
                    color: LOST_TIE_ROW_NAME_COLOR,
                    fontSize: LOST_GRANTS_SOURCE_FONT_SIZE_PX,
                    letterSpacing: LOST_GRANTS_SOURCE_LETTER_SPACING_PX,
                  }}
                >
                  {group.serverName}
                </span>
              )}
            </LostRow>
          ))}
          <LostNote>{LOST_GRANTS_NOTES[group.cause]}</LostNote>
        </Fragment>
      ))}
    </LostTie>
  );
}
