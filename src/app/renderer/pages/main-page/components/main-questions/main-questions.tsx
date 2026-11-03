import { DeleteAgentConfirm, UnsavedAgentConfirm, doomedNeighbourNames } from "../../../../features/agents";
import { ForgetRunConfirm, ForgetRunsConfirm } from "../../../../features/record";
import { DeleteModelConfirm } from "../../../../features/models";
import { DeleteCommandConfirm } from "../../../../features/commands";
import { DeleteServerConfirm, ServerConsent } from "../../../../features/servers";
import { DeletePromptConfirm, PromptEditor } from "../../../../features/prompts";
import { FileConflictConfirm, configDifference, DIFFERENCE_MOVED_SIGN } from "../../../../features/project";
import { quietly } from "../../../../utils/writes";
import type { MainQuestionsProps } from "./interfaces";

/** Every question standing over the working area, each shown only while its own is armed. */
export function MainQuestions({
  project,
  file,
  wayOut,
  agents,
  models,
  commands,
  prompts,
  servers,
  parts,
}: MainQuestionsProps) {
  return (
    <>
      {file.arrived !== null && (
        <FileConflictConfirm
          mine={(wayOut.unsaved?.changes ?? []).map((change) => `${DIFFERENCE_MOVED_SIGN} ${change.label}`)}
          onDisk={configDifference(project.config, file.arrived.config)}
          onKeep={file.keepMine}
          onTake={file.takeArrived}
        />
      )}
      {wayOut.isHeld && wayOut.unsaved !== null && (
        <UnsavedAgentConfirm
          name={wayOut.unsaved.name}
          changes={wayOut.unsaved.changes}
          blocked={wayOut.unsaved.blocked}
          blockedNote={wayOut.unsaved.blockedNote}
          ask={wayOut.ask}
          onSave={() => quietly(wayOut.saveAndLeave)}
          onDiscard={wayOut.discardAndLeave}
          onStay={wayOut.stay}
        />
      )}
      {agents.doomedAgentId !== null && (
        <DeleteAgentConfirm
          name={project.config.agents.find((agent) => agent.id === agents.doomedAgentId)?.name ?? ""}
          neighbourNames={doomedNeighbourNames(project.config.agents, project.config.links, agents.doomedAgentId)}
          onConfirm={agents.confirmDelete}
          onDismiss={agents.dismissDelete}
        />
      )}
      {parts.stream.doomedRun !== null && (
        <ForgetRunConfirm
          run={parts.stream.doomedRun}
          onConfirm={() => void parts.stream.forgetRun()}
          onDismiss={parts.stream.dismissForget}
        />
      )}
      {parts.stream.doomedRuns !== null && (
        <ForgetRunsConfirm
          runs={parts.stream.doomedRuns}
          onConfirm={() => void parts.stream.forgetAllRuns()}
          onDismiss={parts.stream.dismissForgetAll}
        />
      )}
      {commands.armedCommand !== null && (
        <DeleteCommandConfirm
          command={commands.armedCommand}
          onConfirm={commands.confirmDelete}
          onDismiss={commands.dismissDelete}
        />
      )}
      {servers.armedServer !== null && (
        <DeleteServerConfirm
          name={servers.armedServer.name}
          burden={servers.armedBurden}
          onConfirm={servers.confirmDelete}
          onDismiss={servers.dismissDelete}
        />
      )}
      {parts.consent.asked !== null && (
        <ServerConsent
          server={parts.consent.asked}
          directory={project.directory}
          onRun={() => void parts.consent.agree()}
          onDecline={parts.consent.decline}
        />
      )}
      {models.armedModelId !== null && (
        <DeleteModelConfirm
          title={project.config.models.find((model) => model.id === models.armedModelId)?.title ?? ""}
          agents={project.config.agents.filter((agent) => agent.modelId === models.armedModelId)}
          onConfirm={models.confirmDelete}
          onDismiss={models.dismissDelete}
        />
      )}
      {prompts.armedPrompt !== null && (
        <DeletePromptConfirm
          prompt={prompts.armedPrompt}
          agents={prompts.armedPromptAgents}
          onConfirm={prompts.confirmDelete}
          onDismiss={prompts.dismissDelete}
        />
      )}
      {prompts.editedPromptId !== null && prompts.form !== null && (
        <PromptEditor
          values={prompts.form}
          wasName={prompts.wasName}
          isNameTaken={prompts.isNameTaken}
          isNew={prompts.editedPrompt === null}
          hasUnsaved={prompts.isDirty}
          agentNames={prompts.editedPromptAgentNames}
          onChange={prompts.editForm}
          onSave={async () => {
            await prompts.saveForm();
            prompts.closeEditor();
          }}
          onClose={() => wayOut.guard(prompts.closeEditor)}
          onCancel={() => wayOut.guard(prompts.closeEditor, "drop")}
        />
      )}
    </>
  );
}
