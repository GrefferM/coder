export interface EditorNameProps {
  name: string;
  /** The name before this draft changed it; null while unchanged from saved. */
  wasName: string | null;
  /** The name is being written; starts true for a new prompt, and a save refused over the name opens it again. */
  isRenaming: boolean;
  onRenaming: (isRenaming: boolean) => void;
  onRename: (name: string) => void;
}
