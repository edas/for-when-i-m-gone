import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useEncryptDataStore, type EncryptStoreActions } from '@/lib/dataStore';
import {
  defaultIntroCheckboxState,
  type IntroCheckboxState,
} from '@/lib/types/editorTypes';
import { createCheckboxSyncState, syncCheckboxWithNode } from '@/lib/checkboxSync';
import { hasJsonContent } from '@/lib/tiptap/utils';
import { hasNodeTypeInJSON } from '@/lib/tiptap/extensions';
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

const NODE_SYNC_SPEC: {
  getHasNode: (flags: Record<string, boolean>) => boolean;
  key: keyof IntroCheckboxState;
}[] = [
  { getHasNode: (f) => f.recipientsBlock, key: 'secretHolders' },
  { getHasNode: (f) => f.conditionsBlock, key: 'openingConditions' },
  { getHasNode: (f) => f.dateTimeInline, key: 'dated' },
  { getHasNode: (f) => f.quorumInline, key: 'quorum' },
];

function buildChecklistItems(
  keys: { key: keyof IntroCheckboxState; readonly: boolean }[],
  checkboxState: IntroCheckboxState,
  t: (key: string) => string,
  makeSetter: (key: keyof IntroCheckboxState) => (value: boolean) => void
): ChecklistItem[] {
  return keys.map(({ key, readonly }) => ({
    label: t(`introEditor.sidePanel.checkboxes.${key}.title`),
    description: t(`introEditor.sidePanel.checkboxes.${key}.description`),
    value: readonly ? true : checkboxState[key],
    readonly,
    setter: readonly ? null : makeSetter(key),
  }));
}

function computeIntroPanelStatus(
  hasContent: boolean,
  essentials: ChecklistItem[],
  optionals: ChecklistItem[],
  t: (key: string, opts?: Record<string, number>) => string
): { variant: 'error' | 'warning' | 'info' | 'success'; title: string } {
  if (!hasContent) {
    return { variant: 'warning', title: t('introEditor.sidePanel.title') };
  }
  const essentialChecked = essentials.filter((e) => e.value).length;
  const totalChecked = essentialChecked + optionals.filter((e) => e.value).length;
  const totalCheckable = essentials.length + optionals.length;
  const allEssentialsChecked = essentials.every((e) => e.value);

  if (totalChecked === totalCheckable) {
    return {
      variant: 'success',
      title: t('introEditor.sidePanel.successTitle', { count: totalChecked, total: totalCheckable }),
    };
  }
  if (allEssentialsChecked) {
    return {
      variant: 'info',
      title: t('introEditor.sidePanel.infoTitle', { count: totalChecked, total: totalCheckable }),
    };
  }
  return {
    variant: 'warning',
    title: t('introEditor.sidePanel.warningTitle', { count: essentialChecked, total: essentials.length }),
  };
}

/**
 * Compute derived state for IntroEditor validation.
 * Builds essentials/optionals from config and computes variant, title, canContinue from editor state.
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
  const nodeFlags = {
    recipientsBlock: useHasNodeType(editor, INTRO_NODE_TYPES.recipientsBlock),
    conditionsBlock: useHasNodeType(editor, INTRO_NODE_TYPES.conditionsBlock),
    dateTimeInline: useHasNodeType(editor, INTRO_NODE_TYPES.dateTimeInline),
    quorumInline: useHasNodeType(editor, INTRO_NODE_TYPES.quorumInline),
  };

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

  const syncStatesRef = useRef(
    NODE_SYNC_SPEC.map(() => createCheckboxSyncState(false))
  );

  useEffect(() => {
    NODE_SYNC_SPEC.forEach((spec, i) => {
      syncCheckboxWithNode(
        spec.getHasNode(nodeFlags),
        syncStatesRef.current[i],
        makeCheckboxSetter(spec.key)
      );
    });
  }, [nodeFlags.recipientsBlock, nodeFlags.conditionsBlock, nodeFlags.dateTimeInline, nodeFlags.quorumInline, makeCheckboxSetter]);

  const essentialKeys: { key: keyof IntroCheckboxState; readonly: boolean }[] = [
    { key: 'dated', readonly: nodeFlags.dateTimeInline },
    { key: 'quorum', readonly: nodeFlags.quorumInline },
    { key: 'openingConditions', readonly: nodeFlags.conditionsBlock },
    { key: 'secretHolders', readonly: nodeFlags.recipientsBlock },
    { key: 'authorIdentity', readonly: false },
  ];
  const optionalKeys: (keyof IntroCheckboxState)[] = ['directives'];

  const essentials = buildChecklistItems(essentialKeys, checkboxState, t, makeCheckboxSetter);
  const optionals = buildChecklistItems(
    optionalKeys.map((key) => ({ key, readonly: false })),
    checkboxState,
    t,
    makeCheckboxSetter
  );
  const { variant, title } = computeIntroPanelStatus(hasContent, essentials, optionals, t);

  return {
    essentials,
    optionals,
    variant,
    title,
    hasContent,
    canContinue: hasContent,
  };
}
