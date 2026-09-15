/** The colours of a glyph button: at rest, lit under the pointer or the keyboard, and dead where it cannot be pressed. */
export interface IconTone {
  rest: string;
  lit: string;
  dead?: string;
}
