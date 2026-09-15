/** Aria label, state, and change handler. */
export interface ToggleProps {
  label: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}
