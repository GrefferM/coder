/** A locale's language as the widget's switch shows it: «en-US» is «EN». */
export function languageCode(locale: string): string {
  const [language] = locale.split("-");

  return language.toUpperCase();
}
