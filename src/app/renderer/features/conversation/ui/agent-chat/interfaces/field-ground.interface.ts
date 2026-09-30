/** How one state of the send field is painted: ground, edge, and the class its word takes. */
export interface FieldGround {
  background: string;
  border: string;
  /** `null` where the word takes the app's placeholder colour; else a class for a quieter one. */
  wordClass: string | null;
}
