import { ActionButton, Hairline, ModelPreview, QuietLine, StepHead } from "../../../../../../../../components";
import { useStandingStep, useWindowKeydown } from "../../../../../../../../hooks";
import { INTERACTION_ACCENT_COLOR } from "../../../../../../../../constants";
import { AGENT_SETTINGS_FOOTER_BORDER_COLOR, SETTINGS_BACK_LABEL } from "../../constants";
import { TOOLS_SECTION_LOST_NAME } from "../tools-section/constants";
import { MODEL_PREVIEW_GRANTED_NOTE } from "../../../../../../../../components/model-preview/constants";
import { GrantBlock, GrantTitle, OpenIcon, OpenRow, PinnedIcon, PinnedRow } from "./components";
import {
  GRANT_VIEW_BODY_GAP_PX,
  GRANT_VIEW_BODY_PADDING_PX,
  GRANT_VIEW_BOX_GAP_PX,
  GRANT_VIEW_FOOTER_GAP_PX,
  GRANT_VIEW_FOOTER_PADDING_PX,
  GRANT_VIEW_LOST_NOTE,
  GRANT_VIEW_OPEN_LABEL,
  GRANT_VIEW_OPEN_LABEL_COLOR,
  GRANT_VIEW_PINNED_BACKGROUND_COLOR,
  GRANT_VIEW_PINNED_LABEL,
  GRANT_VIEW_PINNED_NOTE,
  GRANT_VIEW_SAVE_LABEL,
} from "./constants";
import { withPinned, withPinnedValue, withoutPinned } from "../../../../../../logic";
import type { GrantViewProps } from "./interfaces";
import { quietly } from "../../../../../../../../utils/writes";

/** One opened grant. Edits go to the tab's draft; only «Зберегти» writes. */
export function GrantView({ agentName, grant, command, onGrantChange, onBack, onSave }: GrantViewProps) {
  // Escape leaves the grant step; draft changes stay.
  useStandingStep(true);
  useWindowKeydown(true, (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
  });
  const parameters = command?.parameters ?? [];
  const pinnedParameterIds = new Set(grant.pinned.map((pinned) => pinned.parameterId));
  const openParameters = parameters.filter((parameter) => !pinnedParameterIds.has(parameter.id));
  const parameterName = (parameterId: string) =>
    parameters.find((parameter) => parameter.id === parameterId)?.name ?? parameterId;

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <StepHead
        whose={agentName}
        name={command?.name ?? TOOLS_SECTION_LOST_NAME}
        backLabel={SETTINGS_BACK_LABEL}
        onBack={onBack}
      />

      <div
        className="d-flex flex-column flex-fill"
        style={{
          padding: GRANT_VIEW_BODY_PADDING_PX,
          gap: GRANT_VIEW_BODY_GAP_PX,
          overflowY: "auto",
        }}
      >
        <GrantTitle
          name={command?.name ?? TOOLS_SECTION_LOST_NAME}
          description={command?.description ?? GRANT_VIEW_LOST_NOTE}
        />
        {grant.pinned.length > 0 && (
          <GrantBlock
            color={INTERACTION_ACCENT_COLOR}
            icon={<PinnedIcon color={INTERACTION_ACCENT_COLOR} />}
            label={`${GRANT_VIEW_PINNED_LABEL} ${agentName}`}
            background={GRANT_VIEW_PINNED_BACKGROUND_COLOR}
            note={<QuietLine>{GRANT_VIEW_PINNED_NOTE}</QuietLine>}
          >
            {grant.pinned.map((pinned, index) => (
              <div
                key={pinned.id}
                className="d-flex flex-column"
                style={{
                  gap: GRANT_VIEW_BOX_GAP_PX,
                }}
              >
                {index > 0 && <Hairline />}
                <PinnedRow
                  name={parameterName(pinned.parameterId)}
                  value={pinned.value}
                  onValueChange={(value) => onGrantChange(withPinnedValue(grant, pinned.id, value))}
                  onUnpin={() => onGrantChange(withoutPinned(grant, pinned.id))}
                />
              </div>
            ))}
          </GrantBlock>
        )}
        {/* What the model still fills in itself — the same rows, in a box nothing holds. */}
        {openParameters.length > 0 && (
          <GrantBlock
            color={GRANT_VIEW_OPEN_LABEL_COLOR}
            icon={<OpenIcon color={GRANT_VIEW_OPEN_LABEL_COLOR} />}
            label={GRANT_VIEW_OPEN_LABEL}
            isDashed
          >
            {openParameters.map((parameter, index) => (
              <div
                key={parameter.id}
                className="d-flex flex-column"
                style={{
                  gap: GRANT_VIEW_BOX_GAP_PX,
                }}
              >
                {index > 0 && <Hairline />}
                <OpenRow
                  parameter={parameter}
                  onPin={() => onGrantChange(withPinned(grant, parameter.id, crypto.randomUUID()))}
                />
              </div>
            ))}
          </GrantBlock>
        )}

        {command !== null && (
          <ModelPreview
            name={command.name}
            description={command.description}
            parameters={openParameters}
            note={MODEL_PREVIEW_GRANTED_NOTE}
          />
        )}
      </div>

      <div
        data-foot
        className="d-flex flex-shrink-0"
        style={{
          padding: GRANT_VIEW_FOOTER_PADDING_PX,
          gap: GRANT_VIEW_FOOTER_GAP_PX,
          borderTop: `1px solid ${AGENT_SETTINGS_FOOTER_BORDER_COLOR}`,
        }}
      >
        <ActionButton variant="save" label={GRANT_VIEW_SAVE_LABEL} onClick={() => quietly(onSave)} />
      </div>
    </div>
  );
}
