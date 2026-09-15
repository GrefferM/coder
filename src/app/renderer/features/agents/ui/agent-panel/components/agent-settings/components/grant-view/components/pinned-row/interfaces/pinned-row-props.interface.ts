export interface PinnedRowProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  onUnpin: () => void;
}
