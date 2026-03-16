import { useEffect, useState } from "react";

const DEFAULT_MS = 300;

/**
 * Returns a debounced value that updates after `delayMs` of no changes.
 * Useful for search inputs that trigger API calls.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = DEFAULT_MS): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
