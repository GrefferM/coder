import { FieldSlot, PickerShell, Words } from "../../../../../../../../components";
import {
  PICKER_PLACEHOLDER_COLOR,
  PICKER_VALUE_COLOR,
} from "../../../../../../../../components/picker-shell/constants";
import { ToolRow } from "./components";
import { LostGrants } from "../lost-grants";
import { SourceGlyph } from "../source-glyph";
import { ToolOption } from "../tool-option";
import { grantFor, grantedOf } from "./logic";
import { brokenGrants } from "../../logic";
import { toolChoices } from "../../../../../../logic";
import {
  TOOLS_SECTION_CHOOSE_LABEL,
  TOOLS_SECTION_CHOSEN_JOIN,
  TOOLS_SECTION_CHOSEN_TAIL,
  TOOLS_SECTION_COMMANDS_LABEL,
  TOOLS_SECTION_COUNT_SEPARATOR,
  TOOLS_SECTION_EMPTY_GAP_PX,
  TOOLS_SECTION_EMPTY_ICON_COLOR,
  TOOLS_SECTION_EMPTY_ICON_SIZE_PX,
  TOOLS_SECTION_EMPTY_NOTE,
  TOOLS_SECTION_EMPTY_PADDING,
  TOOLS_SECTION_GAP_PX,
  TOOLS_SECTION_LIST_MAX_HEIGHT_PX,
  TOOLS_SECTION_LOCKED_NOTE,
} from "./constants";
import { isCommandGrant } from "../../../../../../../../interfaces";
import type { ToolChoice } from "../../../../../../interfaces";
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

  /** Grants if not held, revokes if held; writes the whole draft, so the servers' grants stand. */
  function toggle(option: ToolChoice) {
    const granted = grantedOf(option, grants);

    onGrantsChange(
      granted === null ? [...grants, grantFor(option)] : grants.filter((grant) => grant.id !== granted.id),
    );
  }

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
          <PickerShell
            fieldRef={fieldRef}
            field={
              <span className="flex-fill text-truncate">
                {chosen.length === 0
                  ? TOOLS_SECTION_CHOOSE_LABEL
                  : `${chosen.length}${TOOLS_SECTION_CHOSEN_JOIN}${options.length}${TOOLS_SECTION_CHOSEN_TAIL}`}
              </span>
            }
            fieldColor={chosen.length === 0 ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
            listMaxHeightPx={TOOLS_SECTION_LIST_MAX_HEIGHT_PX}
            isChanged={wasValue !== null}
            items={options}
            matches={(option, query) =>
              option.name.toLowerCase().includes(query) || option.description.toLowerCase().includes(query)
            }
            openedBy={mine}
            choose={(option) => toggle(option)}
            row={(option) => (
              <ToolOption
                key={option.key}
                name={option.name}
                isGranted={grantedOf(option, grants) !== null}
                onToggle={() => toggle(option)}
              />
            )}
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
