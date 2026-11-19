export interface MacLocalePickerProps {
  /** The field's label: the language macOS hears, or the second it hears the same recording in. */
  label: string;
  /** The languages macOS hears on this machine, as locales. */
  locales: string[];
  /** The chosen one; `null` while none is. */
  locale: string | null;
  /** Said in the field while none is chosen. */
  emptyWords: string;
  onChange: (locale: string) => void;
}
