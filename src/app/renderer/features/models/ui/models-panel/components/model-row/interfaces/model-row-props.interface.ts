import type { Agent, ProjectModel } from "../../../../../../../interfaces";

/** `isProviderKnown` is false for a provider this build lacks. */
export interface ModelRowProps {
  model: ProjectModel;
  isProviderKnown: boolean;
  /** `null` when unasked: a remote provider, or a local one still quiet. */
  isInstalled: boolean | null;
  agents: Agent[];
  isOpen: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
