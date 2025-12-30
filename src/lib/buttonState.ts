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

export function getButtonText(
  buttonState: ButtonState,
  texts: {
    continueWithoutConfirm: string;
    continueWithoutEssentials: string;
    continue: string;
  }
): string {
  switch (buttonState) {
    case 'none':
      return texts.continueWithoutConfirm;
    case 'partial':
      return texts.continueWithoutEssentials;
    case 'complete':
      return texts.continue;
  }
}
