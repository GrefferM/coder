export interface TextActionProps {
  label: string;
  isDanger?: boolean;
  isQuiet?: boolean;
  onClick: () => void;
}
