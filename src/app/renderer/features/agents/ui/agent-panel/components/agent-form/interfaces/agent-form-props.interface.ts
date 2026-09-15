import type { Agent, ProjectModel } from "../../../../../../../interfaces";

export interface AgentFormProps {
  models: ProjectModel[];
  agents: Agent[];
  onCreate: (name: string, modelId: string) => Promise<void>;
  onCancel: () => void;
}
