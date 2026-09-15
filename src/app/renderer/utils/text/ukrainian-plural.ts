/** Ukrainian plural for a count: 1 агент, 3 агенти, 5 агентів; the teens 11–14 take the many form. */
export function ukrainianPlural(count: number, one: string, few: string, many: string): string {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return many;
  }

  if (last === 1) {
    return one;
  }

  return last >= 2 && last <= 4 ? few : many;
}
