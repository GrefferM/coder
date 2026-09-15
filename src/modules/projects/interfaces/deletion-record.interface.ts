/** One row of `deletions`, as the table holds it. */
export interface DeletionRecord {
  id: string;
  directory: string;
  kind: string;
  name: string;
  body: string;
  takenAt: Date;
}
