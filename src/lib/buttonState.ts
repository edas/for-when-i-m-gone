export type ButtonState = 'none' | 'partial' | 'complete';

export function computeButtonState(
  hasContent: boolean,
  anyChecked: boolean,
  allEssentialsChecked: boolean
): ButtonState {
  if (!hasContent || !anyChecked) return 'none';
  if (!allEssentialsChecked) return 'partial';
  return 'complete';
}

/**
 * Compute button state for editors with custom validation logic
 * @param canContinue - Whether the form can be continued
 * @param allEssentialsChecked - Whether all essential requirements are met
 */
export function computeButtonStateCustom(
  canContinue: boolean,
  allEssentialsChecked: boolean
): ButtonState {
  if (!canContinue) return 'none';
  return allEssentialsChecked ? 'complete' : 'partial';
}

export function getButtonText(
  buttonState: ButtonState,
  texts: {
    continueWithoutConfirm?: string;
    continueWithoutEssentials: string;
    continue: string;
  }
): string {
  switch (buttonState) {
    case 'none':
      return texts.continueWithoutConfirm ?? texts.continue;
    case 'partial':
      return texts.continueWithoutEssentials;
    case 'complete':
      return texts.continue;
  }
}
