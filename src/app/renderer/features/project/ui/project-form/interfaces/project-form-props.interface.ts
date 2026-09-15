/** The chosen folder, the name being typed into it, and the form's handlers. */
export interface ProjectFormProps {
  directory: string;
  name: string;
  onNameChange: (name: string) => void;
  onChooseDirectory: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}
