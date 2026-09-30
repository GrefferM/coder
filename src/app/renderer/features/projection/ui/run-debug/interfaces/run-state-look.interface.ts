/** How the projection's pill is drawn for one state: the word's colour and the pill around it. */
export interface RunStateLook {
  color: string;
  /** A state quiet enough to need no pill has neither. */
  background: string | null;
  border: string | null;
}
