import type { PickedAttachment } from "../../../../../../../interfaces";

export interface ComposerProps {
  /** The agent the stream is aimed at; `null` when none, so nothing can be sent. */
  agentId: string | null;
  agentName: string;
  isAgentActive: boolean;
  /** A walk is out: the control is «ЗУПИНИТИ» and nothing is sent. */
  isWalking: boolean;
  /** The text typed in this stream; it belongs to the stream, not the agent. */
  draft: string;
  onDraftChange: (draft: string) => void;
  /** Attachments shown as chips; no chip row when empty. */
  attachments: PickedAttachment[];
  /** «+ ПРИКРІПИТИ»: opens the native pick; shown only while the field is open. */
  onAttach: () => void;
  /** The × on a chip — takes one attachment off by its own path. */
  onDetach: (path: string) => void;
  onSend: () => void;
  onStop: () => void;
  /** The height the person pulled the field to; `null` means the least height. */
  fieldHeight: number | null;
  /** Called at the end of a pull, not on every pixel. */
  onFieldHeight: (height: number) => void;
}
