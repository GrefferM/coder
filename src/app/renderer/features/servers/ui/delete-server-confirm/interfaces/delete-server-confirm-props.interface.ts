import type { ServerBurden } from "../../../interfaces";

export interface DeleteServerConfirmProps {
  name: string;
  /** What goes with it, said in words — the grants, and what leaves this machine's keychain. */
  burden: ServerBurden;
  onConfirm: () => void;
  onDismiss: () => void;
}
