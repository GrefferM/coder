/** One deletion as a screen lists it; `taken` holds everything it took, and the module never opens it. */
export interface Deletion {
  id: string;
  kind: string;
  name: string;
  takenAt: Date;
  taken: Record<string, unknown>;
}
