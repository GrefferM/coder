export interface EditorNameProps {
  name: string;
  /** The name before this draft changed it; null while unchanged from saved. */
  wasName: string | null;
  /** The name is being written; true for a just-made prompt or one saved without a name. */
  isRenaming: boolean;
  onRenaming: (isRenaming: boolean) => void;
  onRename: (name: string) => void;
}
