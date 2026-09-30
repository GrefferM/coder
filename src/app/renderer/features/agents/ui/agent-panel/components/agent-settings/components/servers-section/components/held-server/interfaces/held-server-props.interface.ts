export interface HeldServerProps {
  name: string;
  /** «5 з 24»: functions held of all the server offers. */
  held: number;
  functions: number;
  onOpen: () => void;
}
