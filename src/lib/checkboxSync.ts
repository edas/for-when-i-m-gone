/**
 * Helper for syncing checkbox state with node presence in TipTap editor
 */

export interface CheckboxSyncState {
  prevValue: boolean;
}

/**
 * Create initial state for checkbox sync
 */
export function createCheckboxSyncState(initialValue: boolean): CheckboxSyncState {
  return { prevValue: initialValue };
}

/**
 * Sync a checkbox with a node presence value.
 * Call this in a useEffect to automatically check/uncheck when nodes are added/removed.
 * 
 * @param currentHasNode - Current presence of the node (reactive)
 * @param state - Mutable state object to track previous value
 * @param setChecked - Function to update the checkbox state
 */
export function syncCheckboxWithNode(
  currentHasNode: boolean,
  state: CheckboxSyncState,
  setChecked: (checked: boolean) => void
): void {
  const prev = state.prevValue;
  
  if (currentHasNode && !prev) {
    // Node added → check
    setChecked(true);
  } else if (!currentHasNode && prev) {
    // Node removed → uncheck
    setChecked(false);
  }
  
  state.prevValue = currentHasNode;
}

/**
 * Compute initial checkbox states based on content detection or saved state.
 * Used for IntroMessageEditor checkboxes.
 */
export function computeInitialCheckboxState(
  hasNode: boolean,
  savedValue: boolean | undefined
): boolean {
  return hasNode || (savedValue ?? false);
}
