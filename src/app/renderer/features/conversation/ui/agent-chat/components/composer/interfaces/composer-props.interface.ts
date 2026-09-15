export interface ComposerProps {
  /** Whom the stream is aimed at — null while nobody is, and then a question has nowhere to go. */
  agentId: string | null;
  agentName: string;
  isAgentActive: boolean;
  /** This conversation has a walk out, so the hand under the field is «ЗУПИНИТИ» and nothing is sent. */
  isWalking: boolean;
  /** What stands typed in this stream; it belongs to the stream, not to the agent. */
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  onStop: () => void;
  /** How tall the person pulled the field, or nothing where they never did; then it stands at its least. */
  fieldHeight: number | null;
  /** Told at the end of a pull, not on every pixel of it — this is what the machine's note is written from. */
  onFieldHeight: (height: number) => void;
}
