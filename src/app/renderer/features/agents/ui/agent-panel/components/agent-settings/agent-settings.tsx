import { useEffect, useRef, useState } from "react";
import { ActionButton, Field } from "../../../../../../components";
import { FIELD_INVALID_MS } from "../../../../../../components/field/constants";
import { wasAgent } from "../../../../words";
import { isModelLost, isPromptLost, lostProvider, mendedNumber, takesNoTools, withFunction } from "../../../../logic";
import { NAME_TAKEN_AGENT_NOTE } from "../../../../../../constants";

import {
  AgentToolsSection,
  GrantView,
  MemorySection,
  ServerView,
  ServersSection,
  SettingsNumbers,
  SettingsTies,
  SuppliersList,
  ToolsSection,
} from "./components";
import { useToolsStep } from "./hooks";
import {
  AGENT_SETTINGS_ACTION_GAP_PX,
  AGENT_SETTINGS_BODY_GAP_PX,
  AGENT_SETTINGS_BODY_PADDING_PX,
  AGENT_SETTINGS_DELETE_LABEL,
  AGENT_SETTINGS_FOOTER_BORDER_COLOR,
  AGENT_SETTINGS_NAME_LABEL,
  AGENT_SETTINGS_PURPOSE_LABEL,
  AGENT_SETTINGS_PURPOSE_PLACEHOLDER,
  AGENT_SETTINGS_REVERT_LABEL,
  AGENT_SETTINGS_SAVE_LABEL,
} from "./constants";
import type { ToolGrant } from "../../../../../../interfaces";
import type { AgentSettingsProps } from "./interfaces";
import { quietly } from "../../../../../../utils/writes";
import { isCommandGrant } from "../../../../../../interfaces";

/** Selected agent's settings: changes show on the canvas at once, only «Зберегти» writes. */
export function AgentSettings({
  agentId,
  draft,
  catalogue,
  writing,
  standing,
  presses,
  acts,
  openGrantId,
  onOpenGrantChange,
}: AgentSettingsProps) {
  const { models, providers, prompts, commands, servers, looks, agents } = catalogue;
  const { onDraftChange } = acts;
  const nameField = useRef<HTMLInputElement>(null);
  const mendedStepper = useRef<HTMLButtonElement>(null);
  const mendedField = useRef<HTMLButtonElement>(null);
  const mendedRow = presses.mending === "number" ? mendedNumber(draft) : null;
  const [wasTried, setWasTried] = useState(false);

  useEffect(() => {
    if (!wasTried) {
      return;
    }

    const fading = window.setTimeout(() => setWasTried(false), FIELD_INVALID_MS);

    return () => window.clearTimeout(fading);
  }, [wasTried]);

  // A card's arrival puts the cursor on «+» of the row it named.
  useEffect(() => {
    mendedStepper.current?.focus();
  }, [mendedRow]);

  // A card about a tie without its file puts the cursor on the field still holding it.
  useEffect(() => {
    mendedField.current?.focus();
  }, [presses.mending]);

  /** A pasted copy arrives as «EDITOR 2»: focuses the name field and selects its text. */
  useEffect(() => {
    if (!writing.isNaming) {
      return;
    }

    nameField.current?.focus();
    nameField.current?.select();
  }, [writing.isNaming]);
  const isNameMissing = wasTried && !draft.name.trim();
  // The open tools step, and where a press on the agent's arc sends it.
  const { openServerId, openServer } = useToolsStep(presses.tools, presses.agent, onOpenGrantChange);
  // Only a command grant opens in the grant view (its fixed arguments).
  const openGrant = draft.tools.filter(isCommandGrant).find((grant) => grant.id === openGrantId) ?? null;
  // The prompt's file is gone: the field says so rather than «без промпта».
  const isPromptGone = isPromptLost(draft.promptId, prompts);
  // Likewise the model: an empty red field, not the choice placeholder.
  const isModelGone = isModelLost(draft.modelId, models);
  // The model is whole but its provider is unknown to the app; the field names it.
  const goneProviderId = lostProvider(draft.modelId, models, providers);
  // The provider has no function calls: fields are shut, earlier grants stay listed.
  const isToolless = takesNoTools(draft.modelId, models, providers);
  const was = wasAgent(draft, writing.saved, catalogue);

  /** «Зберегти»: an empty name marks the field and writes nothing. */
  function save() {
    if (!draft.name.trim()) {
      setWasTried(true);

      return;
    }

    quietly(acts.onSave);
  }

  function changeGrant(changed: ToolGrant) {
    onDraftChange({
      tools: draft.tools.map((grant) => (grant.id === changed.id ? changed : grant)),
    });
  }

  /** A connected server opens as a step of its own, showing its functions; which one is kept by `useToolsStep`. */
  const serverStep = servers.find((server) => server.id === openServerId) ?? null;

  if (serverStep !== null) {
    return (
      <ServerView
        agentName={draft.name}
        server={serverStep}
        functions={looks[serverStep.id]?.functions ?? []}
        grants={draft.tools}
        onToggle={(functionName) =>
          onDraftChange({
            tools: withFunction(serverStep.id, functionName, draft.tools),
          })
        }
        onBack={() => openServer(null)}
        onSave={acts.onSave}
      />
    );
  }

  if (openGrant !== null) {
    return (
      <GrantView
        agentName={draft.name}
        grant={openGrant}
        command={commands.find((command) => command.id === openGrant.commandId) ?? null}
        onGrantChange={changeGrant}
        onBack={() => onOpenGrantChange(null)}
        onSave={acts.onSave}
      />
    );
  }

  return (
    <div
      className="d-flex flex-column flex-fill"
      style={{
        minHeight: 0,
      }}
    >
      <div
        className="d-flex flex-column flex-fill"
        style={{
          padding: AGENT_SETTINGS_BODY_PADDING_PX,
          gap: AGENT_SETTINGS_BODY_GAP_PX,
          overflowY: "auto",
        }}
      >
        <Field
          ref={nameField}
          label={AGENT_SETTINGS_NAME_LABEL}
          value={draft.name}
          wasValue={was.name}
          note={writing.isNameTaken ? NAME_TAKEN_AGENT_NOTE : undefined}
          isInvalid={isNameMissing || writing.isNameTaken}
          onChange={(name) =>
            onDraftChange({
              name,
            })
          }
        />

        <Field
          label={AGENT_SETTINGS_PURPOSE_LABEL}
          value={draft.purpose ?? ""}
          wasValue={was.purpose}
          placeholder={AGENT_SETTINGS_PURPOSE_PLACEHOLDER}
          isProse
          onChange={(purpose) =>
            onDraftChange({
              // An emptied field is an unwritten one.
              purpose: purpose === "" ? null : purpose,
            })
          }
        />

        <SettingsTies
          draft={draft}
          was={was}
          models={models}
          prompts={prompts}
          agents={agents}
          isModelGone={isModelGone}
          isPromptGone={isPromptGone}
          goneProviderId={goneProviderId}
          mendedField={presses.mending === "prompt" ? mendedField : undefined}
          onDraftChange={onDraftChange}
        />
        <ToolsSection
          isLocked={isToolless}
          fieldRef={presses.mending === "grants" ? mendedField : undefined}
          press={presses.tools}
          commands={commands}
          grants={draft.tools}
          wasValue={was.commandTools}
          onGrantsChange={(tools) =>
            onDraftChange({
              tools,
            })
          }
          onOpenGrant={onOpenGrantChange}
        />
        {/* Commands are chosen one at a time, a server is connected whole; both write into the same draft. */}
        <ServersSection
          isLocked={isToolless}
          servers={servers}
          looks={looks}
          grants={draft.tools}
          wasValue={was.serverTools}
          onGrantsChange={(tools) =>
            onDraftChange({
              tools,
            })
          }
          onOpenServer={openServer}
        />

        <AgentToolsSection
          isLocked={isToolless}
          agents={agents}
          selfId={agentId}
          grants={draft.tools}
          wasValue={was.agentTools}
          onGrantsChange={(tools) =>
            onDraftChange({
              tools,
            })
          }
        />

        <MemorySection
          memory={draft.memory}
          wasValue={was.memory}
          onMemoryChange={(memory) =>
            onDraftChange({
              memory,
            })
          }
        />

        {standing.suppliers.length > 0 && <SuppliersList suppliers={standing.suppliers} />}

        <SettingsNumbers
          draft={draft}
          was={was}
          mendedStepper={mendedStepper}
          mendedRow={mendedRow}
          isConverging={standing.suppliers.length > 1}
          onDraftChange={onDraftChange}
        />
      </div>

      <div
        data-foot
        className="d-flex flex-shrink-0"
        style={{
          padding: AGENT_SETTINGS_BODY_PADDING_PX,
          gap: AGENT_SETTINGS_ACTION_GAP_PX,
          borderTop: `1px solid ${AGENT_SETTINGS_FOOTER_BORDER_COLOR}`,
        }}
      >
        {writing.isDirty ? (
          <ActionButton variant="cancel" label={AGENT_SETTINGS_REVERT_LABEL} onClick={acts.onRevert} />
        ) : (
          <ActionButton variant="delete" label={AGENT_SETTINGS_DELETE_LABEL} onClick={acts.onDelete} />
        )}
        <ActionButton variant="save" label={AGENT_SETTINGS_SAVE_LABEL} onClick={save} />
      </div>
    </div>
  );
}
