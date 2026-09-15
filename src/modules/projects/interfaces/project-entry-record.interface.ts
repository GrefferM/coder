/** The core shape of one project this machine knows about; machine-scoped, it never travels with the project. */
export interface ProjectEntryRecord {
  id: string;
  name: string;
  directory: string;
  openedAt: Date;
  /** Where this machine was looking last time, kept as the renderer wrote it; nobody here opens it. */
  view: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
