/** A project this machine knows about; machine-scoped, never travels with the project. */
export interface ProjectEntryRecord {
  id: string;
  name: string;
  directory: string;
  openedAt: Date;
  /** Last view, kept as the renderer wrote it. */
  view: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
