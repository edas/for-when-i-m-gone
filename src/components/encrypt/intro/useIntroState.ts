import { useTranslation } from 'react-i18next';
import { type UseIntroEditorReturn } from './useIntroEditor';

interface ChecklistItem {
  label: string;
  description: string;
  value: boolean;
  readonly: boolean;
  setter: ((value: boolean) => void) | null;
}

/**
 * Compute derived state for IntroEditor validation.
 * Similar to useHowState for HowEditor — builds essentials/optionals arrays
 * and computes variant, title, canContinue from editor state.
 */
export function useIntroState(editor: UseIntroEditorReturn) {
  const { t } = useTranslation();

  const {
    checkboxState, hasContent,
    hasRecipientsBlock, hasConditionsBlock, hasDateTimeInline, hasQuorumInline,
    setCheckAuthorIdentity, setCheckSecretHolders, setCheckOpeningConditions,
    setCheckDated, setCheckQuorum, setCheckDirectives,
  } = editor;

  const { authorIdentity, secretHolders, openingConditions, dated, quorum, directives } = checkboxState;

  const essentials: ChecklistItem[] = [
    {
      label: t('introEditor.sidePanel.checkboxes.dated.title'),
      description: t('introEditor.sidePanel.checkboxes.dated.description'),
      value: dated,
      readonly: hasDateTimeInline,
      setter: hasDateTimeInline ? null : setCheckDated,
    },
    {
      label: t('introEditor.sidePanel.checkboxes.quorum.title'),
      description: t('introEditor.sidePanel.checkboxes.quorum.description'),
      value: quorum,
      readonly: hasQuorumInline,
      setter: hasQuorumInline ? null : setCheckQuorum,
    },
    {
      label: t('introEditor.sidePanel.checkboxes.openingConditions.title'),
      description: t('introEditor.sidePanel.checkboxes.openingConditions.description'),
      value: openingConditions,
      readonly: hasConditionsBlock,
      setter: hasConditionsBlock ? null : setCheckOpeningConditions,
    },
    {
      label: t('introEditor.sidePanel.checkboxes.secretHolders.title'),
      description: t('introEditor.sidePanel.checkboxes.secretHolders.description'),
      value: secretHolders,
      readonly: hasRecipientsBlock,
      setter: hasRecipientsBlock ? null : setCheckSecretHolders,
    },
    {
      label: t('introEditor.sidePanel.checkboxes.authorIdentity.title'),
      description: t('introEditor.sidePanel.checkboxes.authorIdentity.description'),
      value: authorIdentity,
      readonly: false,
      setter: setCheckAuthorIdentity,
    },
  ];

  const optionals: ChecklistItem[] = [
    {
      label: t('introEditor.sidePanel.checkboxes.directives.title'),
      description: t('introEditor.sidePanel.checkboxes.directives.description'),
      value: directives,
      readonly: false,
      setter: setCheckDirectives,
    },
  ];

  const essentialChecked = essentials.filter(({ value }) => !!value).length;
  const totalChecked = essentialChecked + optionals.filter(({ value }) => !!value).length;
  const totalCheckable = essentials.length + optionals.length;

  const allEssentialsChecked = essentials.every(e => e.value);

  let variant: 'error' | 'warning' | 'info' | 'success' = 'warning';
  let title: string;

  if (!hasContent) {
    variant = 'warning';
    title = t('introEditor.sidePanel.title');
  } else if (totalChecked === totalCheckable) {
    variant = 'success';
    title = t('introEditor.sidePanel.successTitle', { count: totalChecked, total: totalCheckable });
  } else if (allEssentialsChecked) {
    variant = 'info';
    title = t('introEditor.sidePanel.infoTitle', { count: totalChecked, total: totalCheckable });
  } else {
    variant = 'warning';
    title = t('introEditor.sidePanel.warningTitle', { count: essentialChecked, total: essentials.length });
  }

  return {
    essentials,
    optionals,
    variant,
    title,
    hasContent,
    canContinue: hasContent,
  };
}
