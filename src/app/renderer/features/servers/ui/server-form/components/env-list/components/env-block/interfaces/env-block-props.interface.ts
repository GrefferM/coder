export interface EnvBlockProps {
  name: string;
  /** What is typed into the value now; `undefined` if nothing has been typed. */
  draft: string | undefined;
  /** The hint of a value this machine holds, or `undefined` if none. */
  heldHint: string | undefined;
  onNameChange: (name: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
}
