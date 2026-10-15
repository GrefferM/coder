/** `label` is the switch's aria label. */
export interface ToggleProps {
  label: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}
