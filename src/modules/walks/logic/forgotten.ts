export function forgotten<TValue>(standing: Record<string, TValue>, key: string): Record<string, TValue> {
  const rest = {
    ...standing,
  };

  delete rest[key];

  return rest;
}
