export interface NamingOverlayProps {
  directory: string;
  /** The folder's own name: the first guess at the project's, which the person may type over. */
  suggested: string;
  onCreate: (name: string) => void;
  onChooseDirectory: () => void;
  onCancel: () => void;
}
