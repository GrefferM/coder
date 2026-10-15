export interface ProjectFormProps {
  directory: string;
  name: string;
  onNameChange: (name: string) => void;
  onChooseDirectory: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}
