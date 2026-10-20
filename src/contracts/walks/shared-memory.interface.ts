/** An agent's shared memory of a question, told in words, and how far into the record it reaches. */
export interface SharedMemory {
  text: string;
  /** The place of the last step the words stand for or tell; none after it is in them. Zero while there is none. */
  coversPlace: number;
}
