import { t } from 'i18next';
import { useThreshold } from './useThreshold';
import { useRecipientCount } from './useRecipientCount';
import { Editor, useEditorState } from '@tiptap/react';
import { hasJsonContent } from '@/lib/tiptap/utils';
import { EncryptStoreActions, useEncryptDataStore } from '@/lib/dataStore';



/**
 * Compute derived state for HowEditor validation
 */
export function useHowState(editor: Editor) {
  const threshold = useThreshold();
  const recipientCount = useRecipientCount();
  const only2Recipients = recipientCount === 2;

  const hasConditions = useEditorState({editor, selector: ({editor}) => hasJsonContent(editor.getJSON())});
  const hasNoOpenConditions = useEncryptDataStore((state) => state.how?.hasNoOpenConditions ?? false);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const setHasNoOpenConditions = (value: boolean) => setData((current) => ({
    how: {
      ...current.how!,
      hasNoOpenConditions: value,
    },
  }));

  const isValidNumber = threshold !== null;
  const isTooHigh = isValidNumber && threshold > recipientCount;
  const isLessThan2 = isValidNumber && threshold < 2;
  const isPerfectThreshold = isValidNumber && !isLessThan2 && !isTooHigh && threshold >= 3 && threshold <= 5;

  const essentials = [
    { 
      label: t('howEditor.sidePanel.checklist.validThreshold'), 
      value: isValidNumber && !isLessThan2 && !isTooHigh,
      strikethrough: false,
      setter: null,
      description: undefined,
    },
    { 
      label: t('howEditor.sidePanel.checklist.lowerThanRecipientCount'), 
      value: isValidNumber && threshold < recipientCount, 
      strikethrough: only2Recipients,
      setter: null,
      description: t('howEditor.sidePanel.checklist.lowerThanRecipientCountHelp'),
    }, 
    { label: t('howEditor.sidePanel.checklist.hasConditions'), 
      value: hasConditions,
      strikethrough: false,
      setter: null,
      description: undefined,
    },
  ];
  const optionals = [
    { 
      label: t('howEditor.sidePanel.checklist.atLeast3'), 
      value: isValidNumber && threshold >= 3, 
      strikethrough: only2Recipients,
      setter: null,
      description: t('howEditor.sidePanel.checklist.atLeast3Help'),
    },
    { 
      label: t('howEditor.sidePanel.checklist.atMost5'), 
      value: isValidNumber && threshold <= 5,
      strikethrough: false,
      setter: null,
      description: t('howEditor.sidePanel.checklist.atMost5Help'),
    },
    { 
      label: t('howEditor.sidePanel.checklist.hasNoOpenConditions'), 
      value: hasNoOpenConditions, 
      strikethrough: false,
      setter: setHasNoOpenConditions,
      description: undefined,
    },
  ];

  const essentialChecked = essentials.filter(({value}) => !!value).length;
  const totalChecked = essentialChecked +optionals.filter(({value}) => !!value).length;
  const essentialActive = essentials.filter(({strikethrough}) => !strikethrough).length;
  const essentialCheckable = essentials.length;
  const totalCheckable = essentials.length + optionals.length;


  let variant: 'error' | 'warning' | 'info' | 'success' = 'error';
  let title: string;
  if (!isValidNumber) {
    variant = 'error';
    title = t('howEditor.sidePanel.notValidNumber');
  } else if (threshold === 1) {
    variant = 'error';
    title = t('howEditor.sidePanel.oneRecipient');
  } else if (threshold < 2) {
    variant = 'error';
    title = t('howEditor.sidePanel.lessThan2');
  } else if (threshold > recipientCount) {
    variant = 'error';
    title = t('howEditor.sidePanel.quorumTooHighTitle');
  } else if (!hasConditions) {
    variant = 'error';
    title = t('howEditor.sidePanel.missingConditionsTitle');
  } else if (totalChecked === totalCheckable) {
    variant = 'success';
    title = t('howEditor.sidePanel.successTitle', { count: totalChecked, total: totalCheckable });
  } else if (essentialActive === essentialChecked) {
    variant = 'info';
    title = t('howEditor.sidePanel.infoTitle', { count: totalChecked, total: totalCheckable });
  } else {
    variant = 'warning';
    title = t('howEditor.sidePanel.warningTitle', { count: essentialChecked, total: essentialCheckable });
  }

  return {
    isValidNumber,
    isPerfectThreshold,
    hasConditions,
    optionals,
    essentials,
    variant,
    title,
  };
}
