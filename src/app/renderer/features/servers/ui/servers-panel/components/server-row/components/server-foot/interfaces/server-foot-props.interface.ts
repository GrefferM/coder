/** The foot of a server's page, the same in every state; the only place «змінити» lives. */
export interface ServerFootProps {
  onEdit: () => void;
  /** The one place a declared server is deleted; the canvas never deletes one. */
  onDelete: () => void;
}
