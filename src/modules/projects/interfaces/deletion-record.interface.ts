export interface DeletionRecord {
  id: string;
  directory: string;
  kind: string;
  name: string;
  body: string;
  takenAt: Date;
}
