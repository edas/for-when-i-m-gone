import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useEncryptDataStore, type EncryptStoreActions } from '../../../lib/dataStore';
import {
  defaultIntroCheckboxState,
  type IntroCheckboxState,
} from '../../../lib/types/editorTypes';
import { createCheckboxSyncState, syncCheckboxWithNode } from '../../../lib/checkboxSync';
import { hasJsonContent } from '../../../lib/tiptap/utils';
import { hasNodeTypeInJSON } from '../../../lib/tiptap/extensions';
import { INTRO_NODE_TYPES } from './introEditorUtils';

interface ChecklistItem {
  label: string;
  description: string;
  value: boolean;
  readonly: boolean;
  setter: ((value: boolean) => void) | null;
}

function useHasNodeType(editor: Editor | null, nodeType: string): boolean {
  return (
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) =>
        currentEditor ? hasNodeTypeInJSON(currentEditor.getJSON(), nodeType) : false,
    }) ?? false
  );
}

/**
 * Compute derived state for IntroEditor validation.
 * Similar to useHowState for HowEditor — builds essentials/optionals arrays
 * and computes variant, title, canContinue from editor state.
 */
export function useIntroState(editor: Editor | null) {
  const { t } = useTranslation();
  const checkboxState = useEncryptDataStore((state) => state.intro?.checkboxState ?? defaultIntroCheckboxState);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);

  const hasContent =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => (currentEditor ? hasJsonContent(currentEditor.getJSON()) : false),
    }) ?? false;
  const hasRecipientsBlock = useHasNodeType(editor, INTRO_NODE_TYPES.recipientsBlock);
  const hasConditionsBlock = useHasNodeType(editor, INTRO_NODE_TYPES.conditionsBlock);
  const hasDateTimeInline = useHasNodeType(editor, INTRO_NODE_TYPES.dateTimeInline);
  const hasQuorumInline = useHasNodeType(editor, INTRO_NODE_TYPES.quorumInline);

  const makeCheckboxSetter = useCallback(
    (key: keyof IntroCheckboxState) => (value: boolean) => {
      setData((current) => ({
        intro: {
          ...current.intro,
          checkboxState: {
            ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
            [key]: value,
          },
        },
      }));
    },
    [setData]
  );

  const recipientsSyncStateRef = useRef(createCheckboxSyncState(false));
  const conditionsSyncStateRef = useRef(createCheckboxSyncState(false));
  const dateTimeSyncStateRef = useRef(createCheckboxSyncState(false));
  const quorumSyncStateRef = useRef(createCheckboxSyncState(false));

  useEffect(() => {
    syncCheckboxWithNode(hasRecipientsBlock, recipientsSyncStateRef.current, makeCheckboxSetter('secretHolders'));
  }, [hasRecipientsBlock, makeCheckboxSetter]);

  useEffect(() => {
    syncCheckboxWithNode(hasConditionsBlock, conditionsSyncStateRef.current, makeCheckboxSetter('openingConditions'));
  }, [hasConditionsBlock, makeCheckboxSetter]);

  useEffect(() => {
    syncCheckboxWithNode(hasDateTimeInline, dateTimeSyncStateRef.current, makeCheckboxSetter('dated'));
  }, [hasDateTimeInline, makeCheckboxSetter]);

  useEffect(() => {
    syncCheckboxWithNode(hasQuorumInline, quorumSyncStateRef.current, makeCheckboxSetter('quorum'));
  }, [hasQuorumInline, makeCheckboxSetter]);

  const { authorIdentity, secretHolders, openingConditions, dated, quorum, directives } = checkboxState;

  const essentials: ChecklistItem[] = [
    {
      label: t('introEditor.sidePanel.checkboxes.dated.title'),
      description: t('introEditor.sidePanel.checkboxes.dated.description'),
      value: dated,
      readonly: hasDateTimeInline,
      setter: hasDateTimeInline ? null : makeCheckboxSetter('dated'),
    },
    {
      label: t('introEditor.sidePanel.checkboxes.quorum.title'),
      description: t('introEditor.sidePanel.checkboxes.quorum.description'),
      value: quorum,
      readonly: hasQuorumInline,
      setter: hasQuorumInline ? null : makeCheckboxSetter('quorum'),
    },
    {
      label: t('introEditor.sidePanel.checkboxes.openingConditions.title'),
      description: t('introEditor.sidePanel.checkboxes.openingConditions.description'),
      value: openingConditions,
      readonly: hasConditionsBlock,
      setter: hasConditionsBlock ? null : makeCheckboxSetter('openingConditions'),
    },
    {
      label: t('introEditor.sidePanel.checkboxes.secretHolders.title'),
      description: t('introEditor.sidePanel.checkboxes.secretHolders.description'),
      value: secretHolders,
      readonly: hasRecipientsBlock,
      setter: hasRecipientsBlock ? null : makeCheckboxSetter('secretHolders'),
    },
    {
      label: t('introEditor.sidePanel.checkboxes.authorIdentity.title'),
      description: t('introEditor.sidePanel.checkboxes.authorIdentity.description'),
      value: authorIdentity,
      readonly: false,
      setter: makeCheckboxSetter('authorIdentity'),
    },
  ];

  const optionals: ChecklistItem[] = [
    {
      label: t('introEditor.sidePanel.checkboxes.directives.title'),
      description: t('introEditor.sidePanel.checkboxes.directives.description'),
      value: directives,
      readonly: false,
      setter: makeCheckboxSetter('directives'),
    },
  ];

  const essentialChecked = essentials.filter(({ value }) => !!value).length;
  const totalChecked = essentialChecked + optionals.filter(({ value }) => !!value).length;
  const totalCheckable = essentials.length + optionals.length;

  const allEssentialsChecked = essentials.every((e) => e.value);

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
