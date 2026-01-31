export function deepMerge(base, override) {
  const result = Array.isArray(base) ? [...base] : { ...base };

  if (override && typeof override === 'object') {
    Object.keys(override).forEach((key) => {
      const v = override[key];

      if (Array.isArray(v)) {
        // For arrays, language-specific overrides replace base entirely
        result[key] = v;
      } else if (v && typeof v === 'object') {
        result[key] = deepMerge(base?.[key] ?? {}, v);
      } else {
        result[key] = v;
      }
    });
  }

  return result;
}
