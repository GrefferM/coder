/** One choice in a row: its on-screen name and its meaning underneath. */
export interface Choice {
  value: string;
  label: string;
}

/** A row of choices is one field; the keyboard stops once, on the chosen one, as on the colour row. */
export interface ChoiceRowProps {
  label: string;
  choices: Choice[];
  chosen: string;
  note?: string;
  onChoose: (value: string) => void;
}
