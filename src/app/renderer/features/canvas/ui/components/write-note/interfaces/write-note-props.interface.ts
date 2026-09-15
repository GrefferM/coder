import type { WriteNote as Note } from "../../../../../project";

export interface WriteNoteProps {
  note: Note;
  onRetry: () => void;
  onDismiss: () => void;
}
