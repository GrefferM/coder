export interface ColorPickerProps {
  color: string;
  isChanged?: boolean;
  onColorChange: (color: string) => void;
}
