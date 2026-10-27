import { FieldSlot, Words } from "../../../../../../../../components";
import { ToolRow } from "./components";
import { GrantPicker, grantedOf } from "../grant-picker";
import { LostGrants } from "../lost-grants";
import { SourceGlyph } from "../source-glyph";
import { brokenGrants } from "../../logic";
import { toolChoices } from "../../../../../../logic";
import {
  TOOLS_SECTION_CHOOSE_LABEL,
  TOOLS_SECTION_CHOSEN_TAIL,
  TOOLS_SECTION_COMMANDS_LABEL,
  TOOLS_SECTION_COUNT_SEPARATOR,
  TOOLS_SECTION_EMPTY_GAP_PX,
  TOOLS_SECTION_EMPTY_ICON_COLOR,
  TOOLS_SECTION_EMPTY_ICON_SIZE_PX,
  TOOLS_SECTION_EMPTY_NOTE,
  TOOLS_SECTION_EMPTY_PADDING,
  TOOLS_SECTION_GAP_PX,
  TOOLS_SECTION_LOCKED_NOTE,
} from "./constants";
import { isCommandGrant } from "../../../../../../../../interfaces";
import type { ToolsSectionProps } from "./interfaces";

/**
 * The tools' upper half: the project's declared commands. The tick grants and revokes; each grant is a row under the
 * field leading to its pinned arguments. Servers are connected whole in their own section.
 */
export function ToolsSection({
  commands,
  grants,
  press,
  wasValue,
  isLocked,
  fieldRef,
  onGrantsChange,
  onOpenGrant,
}: ToolsSectionProps) {
  /** Only the grey rest opens this list; a command's mark opens its grant and a server's circle opens the server. */
  const mine = press !== null && press.group === null ? press : null;

  const options = toolChoices(commands, [], {});
  const held = grants.filter(isCommandGrant);
  const chosen = options.filter((option) => grantedOf(option, grants) !== null);
  // A grant can outlive its command; a broken one is counted nowhere.
  const broken = brokenGrants(held, {
    commands,
    servers: [],
    looks: {},
    agents: [],
  });
  const brokenIds = new Set(broken.flatMap((group) => group.rows.map((row) => row.id)));

  // The lost group shows even when there is nothing to give.
  if (options.length === 0) {
    return (
      <FieldSlot label={<SourceGlyph source="command" />} wasValue={wasValue}>
        <div
          className="d-flex flex-column"
          style={{
            gap: TOOLS_SECTION_GAP_PX,
          }}
        >
          <div
            className="d-flex flex-column align-items-center text-center"
            style={{
              padding: TOOLS_SECTION_EMPTY_PADDING,
              gap: TOOLS_SECTION_EMPTY_GAP_PX,
            }}
          >
            <svg
              width={TOOLS_SECTION_EMPTY_ICON_SIZE_PX}
              height={TOOLS_SECTION_EMPTY_ICON_SIZE_PX}
              viewBox="0 0 24 24"
              fill="none"
              stroke={TOOLS_SECTION_EMPTY_ICON_COLOR}
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m7 10 3 2.5-3 2.5M13 15h4" />
            </svg>
            <Words isQuiet>{TOOLS_SECTION_EMPTY_NOTE}</Words>
          </div>

          {broken.length > 0 && (
            <LostGrants
              groups={broken}
              onRemove={() => onGrantsChange(grants.filter((grant) => !brokenIds.has(grant.id)))}
            />
          )}
        </div>
      </FieldSlot>
    );
  }

  return (
    <FieldSlot
      label={
        <>
          <SourceGlyph source="command" />
          {`${TOOLS_SECTION_COMMANDS_LABEL}${TOOLS_SECTION_COUNT_SEPARATOR}${held.length - brokenIds.size}`}
        </>
      }
      wasValue={wasValue}
    >
      <div
        className="d-flex flex-column"
        style={{
          gap: TOOLS_SECTION_GAP_PX,
        }}
      >
        {isLocked ? (
          <Words isQuiet>{TOOLS_SECTION_LOCKED_NOTE}</Words>
        ) : (
          <GrantPicker
            options={options}
            grants={grants}
            chooseLabel={TOOLS_SECTION_CHOOSE_LABEL}
            chosenTail={TOOLS_SECTION_CHOSEN_TAIL}
            isChanged={wasValue !== null}
            fieldRef={fieldRef}
            openedBy={mine}
            onGrantsChange={onGrantsChange}
          />
        )}

        {chosen.map((option) => {
          const granted = grantedOf(option, grants);

          return granted === null ? null : (
            <ToolRow
              key={option.key}
              name={option.name}
              pinnedCount={isCommandGrant(granted) ? granted.pinned.length : 0}
              onOpen={() => onOpenGrant(granted.id)}
            />
          );
        })}

        {broken.length > 0 && (
          <LostGrants
            groups={broken}
            onRemove={() => onGrantsChange(grants.filter((grant) => !brokenIds.has(grant.id)))}
          />
        )}
      </div>
    </FieldSlot>
  );
}
