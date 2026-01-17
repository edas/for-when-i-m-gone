/**
 * Utility functions for managing side panel state in sessionStorage
 */

const STORAGE_PREFIX = 'sidePanel_open_';

/**
 * Get the initial state of the side panel for a given editor
 * @param editorId The unique identifier for the editor
 * @param defaultValue The default value if no stored state exists
 * @returns The initial state (true = open, false = closed)
 */
export function getInitialSidePanelState(editorId: string, defaultValue: boolean = true): boolean {
  if (typeof sessionStorage === 'undefined') {
    return defaultValue;
  }
  
  const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${editorId}`);
  if (stored === null) {
    return defaultValue;
  }
  
  return stored === 'true';
}

/**
 * Save the side panel state for a given editor
 * @param editorId The unique identifier for the editor
 * @param isOpen Whether the panel is open (true) or closed (false)
 */
export function saveSidePanelState(editorId: string, isOpen: boolean): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  
  sessionStorage.setItem(`${STORAGE_PREFIX}${editorId}`, String(isOpen));
}
