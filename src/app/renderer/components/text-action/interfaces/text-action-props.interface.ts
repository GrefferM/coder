/** Label, danger/quiet variants, click handler. */
export interface TextActionProps {
  label: string;
  isDanger?: boolean;
  isQuiet?: boolean;
  onClick: () => void;
}
