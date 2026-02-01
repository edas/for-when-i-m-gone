import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EssentialSection } from '../../ui/EssentialSection';
import { HelpSection } from '../../ui/HelpSection';
import { CheckboxItem } from '../../ui/CheckboxItem';
import formControls from '../../../styles/form-controls.module.css';
import helpStyles from '../../ui/HelpSection.module.css';
import { getIntroVariantAndTitle } from '../introEditorUtils';
import { type UseIntroEditorReturn } from './useIntroEditor';

interface IntroEditorHelpContentProps {
  editor: UseIntroEditorReturn;
  onVariantChange?: (variant: 'error' | 'warning' | 'info' | 'success') => void;
}

export function IntroEditorHelpContent({
  editor,
  onVariantChange,
}: IntroEditorHelpContentProps) {
  const { t } = useTranslation();
  
  // Destructure from editor
  const {
    checkboxState,
    hasContent,
    hasRecipientsBlock,
    hasConditionsBlock,
    hasDateTimeInline,
    hasQuorumInline,
    setCheckAuthorIdentity,
    setCheckSecretHolders,
    setCheckOpeningConditions,
    setCheckDated,
    setCheckQuorum,
    setCheckDirectives,
  } = editor;
  
  const { authorIdentity, secretHolders, openingConditions, dated, quorum, directives } = checkboxState;
  
  const allEssentialsChecked = authorIdentity && secretHolders && openingConditions && dated && quorum;
  const anyChecked = authorIdentity || secretHolders || openingConditions || dated || quorum || directives;

  const { variant, title } = useMemo(
    () => getIntroVariantAndTitle(hasContent, allEssentialsChecked, anyChecked, t),
    [hasContent, allEssentialsChecked, anyChecked, t]
  );

  // Notify parent of variant change
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(variant);
    }
  }, [variant, onVariantChange]);

  return (
    <HelpSection title={title}>
      <p className={helpStyles.panelIntro}>{t('introEditor.sidePanel.intro')}</p>

      <EssentialSection note={t('introEditor.sidePanel.essentialNote')}>
        <CheckboxItem
          checked={dated}
          onChange={setCheckDated}
          label={t('introEditor.sidePanel.checkboxes.dated.title')}
          description={t('introEditor.sidePanel.checkboxes.dated.description')}
          essential
          readonly={hasDateTimeInline}
        />
        <CheckboxItem
          checked={quorum}
          onChange={setCheckQuorum}
          label={t('introEditor.sidePanel.checkboxes.quorum.title')}
          description={t('introEditor.sidePanel.checkboxes.quorum.description')}
          essential
          readonly={hasQuorumInline}
        />
        <CheckboxItem
          checked={openingConditions}
          onChange={setCheckOpeningConditions}
          label={t('introEditor.sidePanel.checkboxes.openingConditions.title')}
          description={t('introEditor.sidePanel.checkboxes.openingConditions.description')}
          essential
          readonly={hasConditionsBlock}
        />
        <CheckboxItem
          checked={secretHolders}
          onChange={setCheckSecretHolders}
          label={t('introEditor.sidePanel.checkboxes.secretHolders.title')}
          description={t('introEditor.sidePanel.checkboxes.secretHolders.description')}
          essential
          readonly={hasRecipientsBlock}
        />
        <CheckboxItem
          checked={authorIdentity}
          onChange={setCheckAuthorIdentity}
          label={t('introEditor.sidePanel.checkboxes.authorIdentity.title')}
          description={t('introEditor.sidePanel.checkboxes.authorIdentity.description')}
          essential
        />
      </EssentialSection>

      <div className={formControls.optionalSection}>
        <CheckboxItem
          checked={directives}
          onChange={setCheckDirectives}
          label={t('introEditor.sidePanel.checkboxes.directives.title')}
          description={t('introEditor.sidePanel.checkboxes.directives.description')}
        />
      </div>
    </HelpSection>
  );
}
