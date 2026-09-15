import { AgentPanel } from "../../../../features/agents";
import type { AgentsSectionProps } from "./interfaces";

/** The agents section — one agent's tab, or the form that makes a new one. */
export function AgentsSection({
  project,
  looks,
  agents,
  drafted,
  state,
  providers,
  suppliers,
  startedAt,
  isNamingCopy,
  mending,
  toolsPress,
  agentPress,
  onCollapse,
  onRevert,
  onDeleteAgent,
}: AgentsSectionProps) {
  return (
    <AgentPanel
      catalogue={{
        models: project.config.models,
        providers: providers,
        prompts: project.config.prompts,
        commands: project.config.commands,
        servers: project.config.servers,
        looks: looks,
        agents: project.config.agents,
      }}
      writing={{
        draft: drafted.draft,
        saved: drafted.saved,
        isCreating: agents.pending !== null,
        isNaming: isNamingCopy,
        isDirty: drafted.isDirty,
        isNameTaken: drafted.isNameTaken,
      }}
      standing={{
        state: state,
        startedAt: startedAt,
        suppliers: suppliers,
      }}
      presses={{
        mending: mending,
        tools: toolsPress,
        agent: agentPress,
      }}
      acts={{
        onCreate: agents.createAgent,
        onCancel: onCollapse,
        onDraftChange: drafted.edit,
        onRevert: onRevert,
        onSave: drafted.save,
        onDelete: () => agents.selectedAgentId !== null && onDeleteAgent(agents.selectedAgentId),
      }}
    />
  );
}
