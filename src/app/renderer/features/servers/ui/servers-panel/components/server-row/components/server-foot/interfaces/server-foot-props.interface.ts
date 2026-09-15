/** The foot of the opened card, the same in every state — and the only place «змінити» lives. */
export interface ServerFootProps {
  onEdit: () => void;
  /** The one place a declared server is taken away from; the canvas never deletes one, having no sphere. */
  onDelete: () => void;
}
