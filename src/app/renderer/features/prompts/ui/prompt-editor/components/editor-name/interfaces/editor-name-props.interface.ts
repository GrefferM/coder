export interface EditorNameProps {
  name: string;
  /** What the name was before this draft changed it; null while it stands as it was saved. */
  wasName: string | null;
  /** The name is being written — a prompt just made opens this way, and so does one saved without a name. */
  isRenaming: boolean;
  onRenaming: (isRenaming: boolean) => void;
  onRename: (name: string) => void;
}
