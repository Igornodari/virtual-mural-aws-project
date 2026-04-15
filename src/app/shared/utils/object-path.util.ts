export function getNestedValue<TDefault = unknown>(
  source: unknown,
  path: string,
  defaultValue: TDefault,
): unknown | TDefault {
  if (!source || !path) {
    return defaultValue;
  }

  const value = path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);

  return value ?? defaultValue;
}
