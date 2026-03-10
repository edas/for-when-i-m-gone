/** Sync checkbox state with node presence in TipTap (use in useEffect). */

interface CheckboxSyncState {
  prevValue: boolean;
}

export function createCheckboxSyncState(initialValue: boolean): CheckboxSyncState {
  return { prevValue: initialValue };
}

export function syncCheckboxWithNode(
  currentHasNode: boolean,
  state: CheckboxSyncState,
  setChecked: (checked: boolean) => void
): void {
  const prev = state.prevValue;
  if (currentHasNode && !prev) setChecked(true);
  else if (!currentHasNode && prev) setChecked(false);
  state.prevValue = currentHasNode;
}
