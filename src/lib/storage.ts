/**
 * Safe localStorage wrapper that protects against QuotaExceededError,
 * disabled storage in restricted iframes / privacy mode, and serialization errors.
 */

export const safeStorage = {
  getItem: <T = string>(key: string, parseJson = false): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      if (parseJson) {
        return JSON.parse(item) as T;
      }
      return item as unknown as T;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to read '${key}':`, error);
      return null;
    }
  },

  setItem: (key: string, value: unknown): boolean => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      console.warn(`[SafeStorage] Failed to write '${key}':`, error?.name || error);
      // If quota exceeded, try removing older version keys or temporary caches
      try {
        const keysToClean = ['immo_projects_v8', 'immo_projects_v7', 'immo_projects_v6'];
        keysToClean.forEach(k => localStorage.removeItem(k));
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
      } catch {
        // Silent failure so UI and Supabase data never crash
        return false;
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to remove '${key}':`, error);
    }
  }
};
