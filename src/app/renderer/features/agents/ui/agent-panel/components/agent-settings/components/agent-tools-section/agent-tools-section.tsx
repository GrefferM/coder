import { FieldSlot, PickerShell, Words } from "../../../../../../../../components";
import {
  PICKER_PLACEHOLDER_COLOR,
  PICKER_VALUE_COLOR,
} from "../../../../../../../../components/picker-shell/constants";
import { LostGrants } from "../lost-grants";
import { SourceGlyph } from "../source-glyph";
import { ToolOption } from "../tool-option";
import { grantFor, grantedOf } from "../tools-section";
import { brokenGrants } from "../../logic";
import { agentChoices } from "../../../../../../logic";
import {
  SETTINGS_ROW_BORDER_RADIUS_PX,
  SETTINGS_ROW_NAME_COLOR,
  SETTINGS_ROW_NAME_FONT_SIZE_PX,
  SETTINGS_ROW_PADDING,
} from "../../constants";
import {
  AGENT_TOOLS_SECTION_CHOOSE_LABEL,
  AGENT_TOOLS_SECTION_CHOSEN_JOIN,
  AGENT_TOOLS_SECTION_CHOSEN_TAIL,
  AGENT_TOOLS_SECTION_COUNT_SEPARATOR,
  AGENT_TOOLS_SECTION_EMPTY_GAP_PX,
  AGENT_TOOLS_SECTION_EMPTY_ICON_COLOR,
  AGENT_TOOLS_SECTION_EMPTY_ICON_SIZE_PX,
  AGENT_TOOLS_SECTION_EMPTY_NOTE,
  AGENT_TOOLS_SECTION_EMPTY_PADDING,
  AGENT_TOOLS_SECTION_GAP_PX,
  AGENT_TOOLS_SECTION_LABEL,
  AGENT_TOOLS_SECTION_LIST_MAX_HEIGHT_PX,
  AGENT_TOOLS_SECTION_LOCKED_NOTE,
} from "./constants";
import { isAgentGrant } from "../../../../../../../../interfaces";
import { INTERACTION_REST_BACKGROUND_COLOR, INTERACTION_REST_BORDER_COLOR } from "../../../../../../../../constants";
import type { ToolChoice } from "../../../../../../interfaces";
import type { AgentToolsSectionProps } from "./interfaces";

/** The agents-as-tools field: the project's other agents, each granted whole with nothing pinned. */
export function AgentToolsSection({
  agents,
  selfId,
  grants,
  wasValue,
  isLocked,
  onGrantsChange,
}: AgentToolsSectionProps) {
  const options = agentChoices(agents, selfId);
  // Only agent grants; the commands' and servers' grants are neither counted nor mended here.
  const mine = grants.filter(isAgentGrant);
  const chosen = options.filter((option) => grantedOf(option, grants) !== null);
  // A grant can outlive its agent; a broken one is counted nowhere and shown only in the lost group.
  const broken = brokenGrants(mine, {
    commands: [],
    servers: [],
    looks: {},
    agents,
  });
  const brokenIds = new Set(broken.flatMap((group) => group.rows.map((row) => row.id)));

  /** Grants if not held, revokes if held; writes the whole draft, so other fields' grants stand. */
  function toggle(option: ToolChoice) {
    const granted = grantedOf(option, grants);

    onGrantsChange(
      granted === null ? [...grants, grantFor(option)] : grants.filter((grant) => grant.id !== granted.id),
    );
  }

  return (
    <FieldSlot
      label={
        <>
          <SourceGlyph source="agent" />
          {`${AGENT_TOOLS_SECTION_LABEL}${AGENT_TOOLS_SECTION_COUNT_SEPARATOR}${mine.length - brokenIds.size}`}
        </>
      }
      wasValue={wasValue}
    >
      <div
        className="d-flex flex-column"
        style={{
          gap: AGENT_TOOLS_SECTION_GAP_PX,
        }}
      >
        {isLocked ? (
          <Words isQuiet>{AGENT_TOOLS_SECTION_LOCKED_NOTE}</Words>
        ) : options.length === 0 ? (
          <div
            className="d-flex flex-column align-items-center text-center"
            style={{
              padding: AGENT_TOOLS_SECTION_EMPTY_PADDING,
              gap: AGENT_TOOLS_SECTION_EMPTY_GAP_PX,
            }}
          >
            <svg
              width={AGENT_TOOLS_SECTION_EMPTY_ICON_SIZE_PX}
              height={AGENT_TOOLS_SECTION_EMPTY_ICON_SIZE_PX}
              viewBox="0 0 24 24"
              fill="none"
              stroke={AGENT_TOOLS_SECTION_EMPTY_ICON_COLOR}
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6.5" cy="12" r="3" />
              <circle cx="17.5" cy="12" r="3" />
              <path d="M9.5 12h5" />
            </svg>
            <Words isQuiet>{AGENT_TOOLS_SECTION_EMPTY_NOTE}</Words>
          </div>
        ) : (
          <PickerShell
            field={
              <span className="flex-fill text-truncate">
                {chosen.length === 0
                  ? AGENT_TOOLS_SECTION_CHOOSE_LABEL
                  : `${chosen.length}${AGENT_TOOLS_SECTION_CHOSEN_JOIN}${options.length}${AGENT_TOOLS_SECTION_CHOSEN_TAIL}`}
              </span>
            }
            fieldColor={chosen.length === 0 ? PICKER_PLACEHOLDER_COLOR : PICKER_VALUE_COLOR}
            listMaxHeightPx={AGENT_TOOLS_SECTION_LIST_MAX_HEIGHT_PX}
            isChanged={wasValue !== null}
            items={options}
            matches={(option, query) =>
              option.name.toLowerCase().includes(query) || option.description.toLowerCase().includes(query)
            }
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

        {chosen.map((option) => (
          <div
            key={option.key}
            className="d-flex align-items-center"
            style={{
              padding: SETTINGS_ROW_PADDING,
              borderRadius: SETTINGS_ROW_BORDER_RADIUS_PX,
              border: `1px solid ${INTERACTION_REST_BORDER_COLOR}`,
              background: INTERACTION_REST_BACKGROUND_COLOR,
            }}
          >
            <span
              className="font-monospace flex-fill text-truncate"
              style={{
                color: SETTINGS_ROW_NAME_COLOR,
                fontSize: SETTINGS_ROW_NAME_FONT_SIZE_PX,
              }}
            >
              {option.name}
            </span>
          </div>
        ))}

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
