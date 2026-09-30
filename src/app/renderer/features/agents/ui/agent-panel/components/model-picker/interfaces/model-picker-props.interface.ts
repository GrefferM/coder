import type { Agent, ProjectModel } from "../../../../../../../interfaces";

export interface ModelPickerProps {
  models: ProjectModel[];
  agents: Agent[];
  modelId: string;
  isInvalid?: boolean;
  /** The agent's model has lost its file: the field is empty and red. */
  isLost?: boolean;
  /** The model is whole but its provider is undeclared; named under the field. */
  lostProviderId?: string | null;
  isChanged?: boolean;
  onModelIdChange: (modelId: string) => void;
}
