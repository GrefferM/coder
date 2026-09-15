/** How one state of the send field is painted — its ground, its edge, and the class its word takes. */
export interface FieldGround {
  background: string;
  border: string;
  /** Null where the word takes the app's own placeholder colour; a class where it says something quieter. */
  wordClass: string | null;
}
