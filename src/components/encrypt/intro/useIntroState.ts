import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useEncryptDataStore, type EncryptStoreActions } from '../../../lib/dataStore';
import { defaultIntroCheckboxState } from '../../../lib/types/editorTypes';
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

/**
 * Compute derived state for IntroEditor validation.
 * Similar to useHowState for HowEditor — builds essentials/optionals arrays
 * and computes variant, title, canContinue from editor state.
 */
export function useIntroState(editor: Editor | null) {
  const { t } = useTranslation();
  const checkboxState = useEncryptDataStore((state) => state.intro?.checkboxState ?? defaultIntroCheckboxState);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);

  const hasContent = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => (currentEditor ? hasJsonContent(currentEditor.getJSON()) : false),
  }) ?? false;
  const hasRecipientsBlock = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => (
      currentEditor
        ? hasNodeTypeInJSON(currentEditor.getJSON(), INTRO_NODE_TYPES.recipientsBlock)
        : false
    ),
  }) ?? false;
  const hasConditionsBlock = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => (
      currentEditor
        ? hasNodeTypeInJSON(currentEditor.getJSON(), INTRO_NODE_TYPES.conditionsBlock)
        : false
    ),
  }) ?? false;
  const hasDateTimeInline = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => (
      currentEditor
        ? hasNodeTypeInJSON(currentEditor.getJSON(), INTRO_NODE_TYPES.dateTimeInline)
        : false
    ),
  }) ?? false;
  const hasQuorumInline = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => (
      currentEditor
        ? hasNodeTypeInJSON(currentEditor.getJSON(), INTRO_NODE_TYPES.quorumInline)
        : false
    ),
  }) ?? false;

  const setCheckAuthorIdentity = useCallback((value: boolean) => {
    setData((current) => ({
      intro: {
        ...current.intro,
        checkboxState: {
          ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
          authorIdentity: value,
        },
      },
    }));
  }, [setData]);

  const setCheckSecretHolders = useCallback((value: boolean) => {
    setData((current) => ({
      intro: {
        ...current.intro,
        checkboxState: {
          ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
          secretHolders: value,
        },
      },
    }));
  }, [setData]);

  const setCheckOpeningConditions = useCallback((value: boolean) => {
    setData((current) => ({
      intro: {
        ...current.intro,
        checkboxState: {
          ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
          openingConditions: value,
        },
      },
    }));
  }, [setData]);

  const setCheckDated = useCallback((value: boolean) => {
    setData((current) => ({
      intro: {
        ...current.intro,
        checkboxState: {
          ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
          dated: value,
        },
      },
    }));
  }, [setData]);

  const setCheckQuorum = useCallback((value: boolean) => {
    setData((current) => ({
      intro: {
        ...current.intro,
        checkboxState: {
          ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
          quorum: value,
        },
      },
    }));
  }, [setData]);

  const setCheckDirectives = useCallback((value: boolean) => {
    setData((current) => ({
      intro: {
        ...current.intro,
        checkboxState: {
          ...(current.intro?.checkboxState ?? defaultIntroCheckboxState),
          directives: value,
        },
      },
    }));
  }, [setData]);

  const recipientsSyncStateRef = useRef(createCheckboxSyncState(false));
  const conditionsSyncStateRef = useRef(createCheckboxSyncState(false));
  const dateTimeSyncStateRef = useRef(createCheckboxSyncState(false));
  const quorumSyncStateRef = useRef(createCheckboxSyncState(false));

  useEffect(() => {
    syncCheckboxWithNode(hasRecipientsBlock, recipientsSyncStateRef.current, setCheckSecretHolders);
  }, [hasRecipientsBlock, setCheckSecretHolders]);

  useEffect(() => {
    syncCheckboxWithNode(hasConditionsBlock, conditionsSyncStateRef.current, setCheckOpeningConditions);
  }, [hasConditionsBlock, setCheckOpeningConditions]);

  useEffect(() => {
    syncCheckboxWithNode(hasDateTimeInline, dateTimeSyncStateRef.current, setCheckDated);
  }, [hasDateTimeInline, setCheckDated]);

  useEffect(() => {
    syncCheckboxWithNode(hasQuorumInline, quorumSyncStateRef.current, setCheckQuorum);
  }, [hasQuorumInline, setCheckQuorum]);

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
