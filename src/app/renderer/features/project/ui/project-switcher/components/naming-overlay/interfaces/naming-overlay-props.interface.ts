export interface NamingOverlayProps {
  directory: string;
  /** The folder's name: the first guess at the project's, which the person may overtype. */
  suggested: string;
  onCreate: (name: string) => void;
  onChooseDirectory: () => void;
  onCancel: () => void;
}
