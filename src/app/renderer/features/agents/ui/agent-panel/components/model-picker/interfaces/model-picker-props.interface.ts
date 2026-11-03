import type { Agent, ProjectModel } from "../../../../../../../interfaces";

export interface ModelPickerProps {
  models: ProjectModel[];
  agents: Agent[];
  modelId: string;
  isInvalid?: boolean;
  /** The agent's model has lost its file: the field is empty and red. */
  isLost?: boolean;
  /** The model is whole but its provider is unknown to the app; named under the field. */
  lostProviderId?: string | null;
  /** The chosen model's provider is turned off on this machine; named under the field. */
  offProviderName?: string | null;
  /** The models standing on a provider turned off on this machine; their rows say so. */
  offModelIds?: string[];
  isChanged?: boolean;
  onModelIdChange: (modelId: string) => void;
}
