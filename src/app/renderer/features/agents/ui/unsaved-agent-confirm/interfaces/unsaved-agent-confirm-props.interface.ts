import type { FieldChange } from "../../../../../interfaces";
import type { WayOutAsk } from "../../../../../hooks/use-way-out/interfaces";

/** Any empty required field blocks writing. */
export interface UnsavedAgentConfirmProps {
  name: string;
  changes: FieldChange[];
  blocked: string[];
  blockedNote: string | null;
  ask: WayOutAsk;
  onSave: () => void;
  onDiscard: () => void;
  onStay: () => void;
}
