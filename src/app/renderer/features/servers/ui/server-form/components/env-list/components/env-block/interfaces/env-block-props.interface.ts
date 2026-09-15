export interface EnvBlockProps {
  name: string;
  /** What is typed into the value right now; `undefined` while nothing has been typed at all. */
  draft: string | undefined;
  /** The hint of a value this machine already holds, or `undefined` where it holds none. */
  heldHint: string | undefined;
  onNameChange: (name: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
}
