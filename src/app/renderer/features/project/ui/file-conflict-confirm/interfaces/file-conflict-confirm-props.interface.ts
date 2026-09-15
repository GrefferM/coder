export interface FileConflictConfirmProps {
  mine: string[];
  onDisk: string[];
  onKeep: () => void;
  onTake: () => void;
}
