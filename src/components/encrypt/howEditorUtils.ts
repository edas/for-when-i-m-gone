import { TFunction } from 'i18next';

/**
 * Get default threshold based on recipient count
 */
export function getDefaultThreshold(count: number): number {
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Parse threshold input string to number or null
 */
export function parseThreshold(inputValue: string): number | null {
  const trimmed = inputValue.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (isNaN(num) || !isFinite(num) || !Number.isInteger(num)) return null;
  return num;
}

/**
 * Compute derived state for HowEditor validation
 */
export function computeHowDerivedState(
  threshold: number | null,
  recipientCount: number,
  hasConditions: boolean
) {
  const isValidNumber = threshold !== null;
  const isOne = threshold === 1;
  const isValidThreshold = threshold !== null && threshold >= 2;
  const isTooHigh = threshold !== null && threshold > recipientCount;
  const isLowerThanRecipientCount = threshold !== null && threshold < recipientCount;
  const isAtLeast3 = threshold !== null && threshold >= 3;
  const isAtMost5 = threshold !== null && threshold <= 5;

  const isError = !isValidNumber || (threshold !== null && (threshold < 2 || threshold > recipientCount));
  const isGreen = threshold !== null && threshold >= 3 && threshold <= 5 && threshold < recipientCount;

  const canContinue = isValidThreshold && !isTooHigh;

  const allEssentialsChecked = 
    isValidThreshold && 
    (recipientCount <= 2 || isLowerThanRecipientCount) && 
    hasConditions;

  return {
    isValidNumber,
    isOne,
    isValidThreshold,
    isTooHigh,
    isLowerThanRecipientCount,
    isAtLeast3,
    isAtMost5,
    isError,
    isGreen,
    canContinue,
    allEssentialsChecked,
  };
}

export type HowDerivedState = ReturnType<typeof computeHowDerivedState>;

/**
 * Get variant and title for the help section based on validation state
 */
export function getVariantAndTitle(
  canContinue: boolean,
  essentials: boolean[],
  optional: boolean[],
  hasConditions: boolean,
  essentialsStrikethrough: boolean[],
  optionalStrikethrough: boolean[],
  isTooHigh: boolean,
  t: TFunction
): { variant: 'error' | 'warning' | 'info' | 'success'; title: string } {
  if (isTooHigh) {
    return {
      variant: 'error',
      title: t('howEditor.sidePanel.quorumTooHighTitle'),
    };
  }
  if (canContinue && !hasConditions) {
    return {
      variant: 'error',
      title: t('howEditor.sidePanel.missingConditionsTitle'),
    };
  }
  if (!canContinue) {
    return {
      variant: 'error',
      title: t('howEditor.sidePanel.errorTitle'),
    };
  }

  // For determining satisfaction, only count non-strikethrough criteria
  const activeEssentials = essentials.filter((_, index) => !essentialsStrikethrough[index]);
  const activeOptional = optional.filter((_, index) => !optionalStrikethrough[index]);
  const activeEssentialCount = activeEssentials.filter(Boolean).length;
  const activeEssentialTotal = activeEssentials.length;
  const activeOptionalCount = activeOptional.filter(Boolean).length;
  const activeOptionalTotal = activeOptional.length;
  const activeAllCheckedCount = activeEssentialCount + activeOptionalCount;
  const activeAllTotal = activeEssentialTotal + activeOptionalTotal;
  const allChecked = activeAllCheckedCount === activeAllTotal && activeAllTotal > 0;
  const allEssentialChecked = activeEssentialCount === activeEssentialTotal && activeEssentialTotal > 0;

  // For display in title, count all criteria (including strikethrough)
  const essentialCount = essentials.filter(Boolean).length;
  const essentialTotal = essentials.length;
  const allCheckedCount = essentialCount + optional.filter(Boolean).length;
  const allTotal = essentialTotal + optional.length;

  if (allChecked) {
    return {
      variant: 'success',
      title: t('howEditor.sidePanel.successTitle', { count: allCheckedCount, total: allTotal }),
    };
  }
  if (allEssentialChecked) {
    return {
      variant: 'info',
      title: t('howEditor.sidePanel.infoTitle', { count: allCheckedCount, total: allTotal }),
    };
  }
  return {
    variant: 'warning',
    title: t('howEditor.sidePanel.warningTitle', { count: essentialCount, total: essentialTotal }),
  };
}
