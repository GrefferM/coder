import { FieldSlot, Words } from "../../../../../../../../components";
import { GrantPicker, grantedOf } from "../grant-picker";
import { GrantedRow } from "../granted-row";
import { SourceGlyph } from "../source-glyph";
import { systemChoices } from "../../../../../../logic";
import {
  SYSTEM_TOOLS_SECTION_CHOOSE_LABEL,
  SYSTEM_TOOLS_SECTION_CHOSEN_TAIL,
  SYSTEM_TOOLS_SECTION_COUNT_SEPARATOR,
  SYSTEM_TOOLS_SECTION_GAP_PX,
  SYSTEM_TOOLS_SECTION_LABEL,
  SYSTEM_TOOLS_SECTION_LOCKED_NOTE,
  SYSTEM_TOOLS_SECTION_NO_LINES_NOTE,
} from "./constants";
import { isSystemGrant } from "../../../../../../../../interfaces";
import type { SystemToolsSectionProps } from "./interfaces";

/** The system commands field: the app's own commands, each granted like any tool. */
export function SystemToolsSection({
  grants,
  followerCount,
  wasValue,
  isLocked,
  onGrantsChange,
}: SystemToolsSectionProps) {
  const options = systemChoices();
  const mine = grants.filter(isSystemGrant);
  const chosen = options.filter((option) => grantedOf(option, grants) !== null);
  // With no line going out a command has nobody to pass to: the row stands dimmed and says why.
  const note = followerCount === 0 ? SYSTEM_TOOLS_SECTION_NO_LINES_NOTE : null;

  return (
    <FieldSlot
      label={
        <>
          <SourceGlyph source="system" />
          {`${SYSTEM_TOOLS_SECTION_LABEL}${SYSTEM_TOOLS_SECTION_COUNT_SEPARATOR}${mine.length}`}
        </>
      }
      wasValue={wasValue}
    >
      <div
        className="d-flex flex-column"
        style={{
          gap: SYSTEM_TOOLS_SECTION_GAP_PX,
        }}
      >
        {isLocked ? (
          <Words isQuiet>{SYSTEM_TOOLS_SECTION_LOCKED_NOTE}</Words>
        ) : (
          <GrantPicker
            options={options}
            grants={grants}
            chooseLabel={SYSTEM_TOOLS_SECTION_CHOOSE_LABEL}
            chosenTail={SYSTEM_TOOLS_SECTION_CHOSEN_TAIL}
            isChanged={wasValue !== null}
            onGrantsChange={onGrantsChange}
          />
        )}

        {chosen.map((option) => (
          <GrantedRow key={option.key} name={option.name} note={note} />
        ))}
      </div>
    </FieldSlot>
  );
}
