export interface MacLocalePickerProps {
  /** The languages macOS hears on this machine, as locales. */
  locales: string[];
  /** The chosen one; `null` while none is. */
  locale: string | null;
  onChange: (locale: string) => void;
}
