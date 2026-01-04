/**
 * Utility functions for common editor patterns
 */

import { getTranslations, type Language } from './i18n';
import { updateStoredDataDebounced, type StoredData } from './dataStore';

/**
 * Get translations for an editor
 */
export function getEditorTranslations(lang: Language) {
  return getTranslations(lang);
}

/**
 * Create auto-save effect helper
 * Usage: $effect(() => autoSave(getCurrentData, 'how'));
 */
export function autoSave<T>(
  getData: () => T,
  storageKey: keyof StoredData
): void {
  const data = getData();
  updateStoredDataDebounced({ [storageKey]: data } as Partial<StoredData>);
}
