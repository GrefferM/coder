/** One of the choices in a row: what it is called on the screen, and what it means underneath. */
export interface Choice {
  value: string;
  label: string;
}

/**
 * A row of choices is **one field** — the keyboard stops on it once, on the one already
 * chosen, exactly as it does on the row of colours.
 */
export interface ChoiceRowProps {
  label: string;
  choices: Choice[];
  chosen: string;
  note?: string;
  onChoose: (value: string) => void;
}
