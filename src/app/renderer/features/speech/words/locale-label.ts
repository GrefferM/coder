import { MAC_LOCALE_LANGUAGE, VOICE_NAME_SEPARATOR } from "../constants";

const LANGUAGE_NAMES = new Intl.DisplayNames([MAC_LOCALE_LANGUAGE], {
  type: "language",
});

/** A locale by its language's name and its code: «Англійська · en-US». */
export function localeLabel(locale: string): string {
  const [language] = locale.split("-");
  const name = LANGUAGE_NAMES.of(language) ?? language;

  return `${name.charAt(0).toUpperCase()}${name.slice(1)}${VOICE_NAME_SEPARATOR}${locale}`;
}
