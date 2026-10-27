import { FieldSlot, Words } from "../../../../../../../../components";
import { GrantPicker, grantedOf } from "../grant-picker";
import { GrantedRow } from "../granted-row";
import { LostGrants } from "../lost-grants";
import { SourceGlyph } from "../source-glyph";
import { brokenGrants } from "../../logic";
import { agentChoices } from "../../../../../../logic";
import {
  AGENT_TOOLS_SECTION_CHOOSE_LABEL,
  AGENT_TOOLS_SECTION_CHOSEN_TAIL,
  AGENT_TOOLS_SECTION_COUNT_SEPARATOR,
  AGENT_TOOLS_SECTION_EMPTY_GAP_PX,
  AGENT_TOOLS_SECTION_EMPTY_ICON_COLOR,
  AGENT_TOOLS_SECTION_EMPTY_ICON_SIZE_PX,
  AGENT_TOOLS_SECTION_EMPTY_NOTE,
  AGENT_TOOLS_SECTION_EMPTY_PADDING,
  AGENT_TOOLS_SECTION_GAP_PX,
  AGENT_TOOLS_SECTION_LABEL,
  AGENT_TOOLS_SECTION_LOCKED_NOTE,
} from "./constants";
import { isAgentGrant } from "../../../../../../../../interfaces";
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
          <GrantPicker
            options={options}
            grants={grants}
            chooseLabel={AGENT_TOOLS_SECTION_CHOOSE_LABEL}
            chosenTail={AGENT_TOOLS_SECTION_CHOSEN_TAIL}
            isChanged={wasValue !== null}
            onGrantsChange={onGrantsChange}
          />
        )}

        {chosen.map((option) => (
          <GrantedRow key={option.key} name={option.name} note={null} />
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
