export interface EditorHeadProps {
  /** The prompt's own name, or nothing yet — the head then says the placeholder in its place. */
  name: string;
  words: number;
  hasUnsaved: boolean;
  onClose: () => void;
}
