export interface EditorHeadProps {
  /** The prompt's name; empty shows the placeholder. */
  name: string;
  words: number;
  hasUnsaved: boolean;
  onClose: () => void;
}
