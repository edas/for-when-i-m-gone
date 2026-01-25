import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EssentialSection } from '../../ui/EssentialSection';
import { HelpSection } from '../../ui/HelpSection';
import { CheckboxItem } from '../../ui/CheckboxItem';
import formControls from '../../../styles/form-controls.module.css';
import helpStyles from '../../ui/HelpSection.module.css';
import { type HowDerivedState, getVariantAndTitle } from '../howEditorUtils';

interface HowEditorHelpContentProps {
  derived: HowDerivedState;
  hasConditions: boolean;
  hasNoOpenConditions: boolean;
  onHasNoOpenConditionsChange: (value: boolean) => void;
  recipientCount: number;
  onVariantChange?: (variant: 'error' | 'warning' | 'info' | 'success') => void;
}

export function HowEditorHelpContent({
  derived,
  hasConditions,
  hasNoOpenConditions,
  onHasNoOpenConditionsChange,
  recipientCount,
  onVariantChange,
}: HowEditorHelpContentProps) {
  const { t } = useTranslation();
  
  const {
    isValidThreshold,
    isTooHigh,
    isLowerThanRecipientCount,
    isAtLeast3,
    isAtMost5,
    canContinue,
  } = derived;

  const essentials = [isValidThreshold && !isTooHigh, isLowerThanRecipientCount, hasConditions];
  const optional = [isAtLeast3, isAtMost5, hasNoOpenConditions];
  const essentialsStrikethrough = useMemo(() => [false, recipientCount <= 2, false], [recipientCount]);
  const optionalStrikethrough = useMemo(() => [recipientCount <= 2, false, false], [recipientCount]);
  const { variant, title } = useMemo(
    () => getVariantAndTitle(canContinue, essentials, optional, hasConditions, essentialsStrikethrough, optionalStrikethrough, isTooHigh, t),
    [canContinue, essentials, optional, hasConditions, essentialsStrikethrough, optionalStrikethrough, isTooHigh, t]
  );

  // Notify parent of variant change
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(variant);
    }
  }, [variant, onVariantChange]);

  return (
    <HelpSection title={title}>
      <p className={helpStyles.panelIntro}>{t('howEditor.sidePanel.intro')}</p>
      <EssentialSection note={t('howEditor.sidePanel.essentialNote')}>
        <CheckboxItem
          checked={isValidThreshold && !isTooHigh}
          label={t('howEditor.sidePanel.checklist.validThreshold')}
          readonly
        />
        <CheckboxItem
          checked={isLowerThanRecipientCount}
          label={t('howEditor.sidePanel.checklist.lowerThanRecipientCount')}
          description={t('howEditor.sidePanel.checklist.lowerThanRecipientCountHelp')}
          strikethrough={recipientCount <= 2}
          readonly
        />
        <CheckboxItem
          checked={hasConditions}
          label={t('howEditor.sidePanel.checklist.hasConditions')}
          readonly
        />
      </EssentialSection>

      <div className={formControls.optionalSection}>
        <CheckboxItem
          checked={isAtLeast3}
          label={t('howEditor.sidePanel.checklist.atLeast3')}
          description={t('howEditor.sidePanel.checklist.atLeast3Help')}
          strikethrough={recipientCount <= 2}
          readonly
        />
        <CheckboxItem
          checked={isAtMost5}
          label={t('howEditor.sidePanel.checklist.atMost5')}
          description={t('howEditor.sidePanel.checklist.atMost5Help')}
          readonly
        />
        <CheckboxItem
          checked={hasNoOpenConditions}
          onChange={onHasNoOpenConditionsChange}
          label={t('howEditor.sidePanel.checklist.hasNoOpenConditions')}
          readonly={!hasConditions}
        />
      </div>
    </HelpSection>
  );
}
