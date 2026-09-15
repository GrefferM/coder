import type { Agent, ProjectModel } from "../../../../../../../interfaces";

export interface ModelPickerProps {
  models: ProjectModel[];
  agents: Agent[];
  modelId: string;
  isInvalid?: boolean;
  /** The model this agent names has lost its file, so the field stands empty and red. */
  isLost?: boolean;
  /** The model is whole, but nobody declared the provider it stands on — named under the field. */
  lostProviderId?: string | null;
  isChanged?: boolean;
  onModelIdChange: (modelId: string) => void;
}
