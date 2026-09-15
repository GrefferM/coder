import { useEffect, useRef, useState } from "react";
import { ActionButton, Field } from "../../../../../../components";
import { FIELD_INVALID_MS } from "../../../../../../components/field/constants";
import { wasAgent } from "../../../../words";
import { isModelLost, isPromptLost, lostProvider, mendedNumber, withFunction } from "../../../../logic";
import { NAME_TAKEN_AGENT_NOTE } from "../../../../../../constants";

import {
  GrantView,
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
  AGENT_SETTINGS_REVERT_LABEL,
  AGENT_SETTINGS_SAVE_LABEL,
} from "./constants";
import type { ToolGrant } from "../../../../../../interfaces";
import type { AgentSettingsProps } from "./interfaces";
import { quietly } from "../../../../../../utils/writes";
import { isCommandGrant } from "../../../../../../interfaces";

/** Selected agent's settings — changes show on the canvas at once, only «Зберегти» writes. */
export function AgentSettings({
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

  // Sent here by a card, the cursor lands on «+» of the row it named — the way out of an empty one.
  useEffect(() => {
    mendedStepper.current?.focus();
  }, [mendedRow]);

  // A card about a tie left without its file lands the cursor on the field that still holds that tie.
  useEffect(() => {
    mendedField.current?.focus();
  }, [presses.mending]);

  /** A pasted copy arrives as «EDITOR 2» — focus the name field and select its text. */
  useEffect(() => {
    if (!writing.isNaming) {
      return;
    }

    nameField.current?.focus();
    nameField.current?.select();
  }, [writing.isNaming]);
  const isNameMissing = wasTried && !draft.name.trim();
  // Which step of the tools the tab stands on, and where a press on the agent's arc sends it.
  const { openServerId, openServer } = useToolsStep(presses.tools, presses.agent, onOpenGrantChange);
  // The grant view is about a command's fixed arguments, so only a command grant opens in it.
  const openGrant = draft.tools.filter(isCommandGrant).find((grant) => grant.id === openGrantId) ?? null;
  // The agent points at a prompt whose file is gone — the field says so instead of reading as «без промпта».
  const isPromptGone = isPromptLost(draft.promptId, prompts);
  // The same for the model — an empty red field, not the placeholder of a choice never made.
  const isModelGone = isModelLost(draft.modelId, models);
  // The model is whole, but nobody declared the provider under it — the field names it in the same words.
  const goneProviderId = lostProvider(draft.modelId, models, providers);
  const was = wasAgent(draft, writing.saved, models, prompts, commands, servers);

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

  /**
   * A connected server opens as a step of its own, the way an opened grant does: the whole tab becomes that
   * server's functions, with the way back in its head. Which server that is stays in this tab and is not lifted to
   * the panel — a card can send somebody to a grant, and nothing sends anybody to a server but the arc, which the
   * tab hears here for itself.
   */
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
        {/*
         * Two sections, and they are not two halves of one thing: a command is written by hand one at a time and
         * is chosen the same way, while a server arrives whole and is connected whole. Both write into the same
         * draft, so a tick in one never drops what the other holds.
         */}
        <ServersSection
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

        {standing.suppliers.length > 0 && <SuppliersList suppliers={standing.suppliers} />}

        <SettingsNumbers
          draft={draft}
          was={was}
          mendedStepper={mendedStepper}
          mendedRow={mendedRow}
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
