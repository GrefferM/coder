import type { ServerBurden } from "../../../interfaces";

export interface DeleteServerConfirmProps {
  name: string;
  /** What goes with the server: the grants and what leaves this machine's keychain. */
  burden: ServerBurden;
  onConfirm: () => void;
  onDismiss: () => void;
}
