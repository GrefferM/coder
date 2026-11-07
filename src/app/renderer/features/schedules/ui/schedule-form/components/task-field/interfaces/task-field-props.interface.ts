export interface TaskFieldProps {
  label: string;
  value: string;
  placeholder: string;
  isInvalid: boolean;
  onChange: (value: string) => void;
}
