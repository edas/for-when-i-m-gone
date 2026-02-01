import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../../lib/dataStore';
import { type IntroCheckboxState } from '../../../lib/types/editorTypes';
import { 
  RecipientsBlock, 
  ConditionsBlock, 
  DateTimeInline, 
  QuorumInline, 
  DynamicDataExtension,
  hasNodeTypeInJSON 
} from '../../../lib/tiptap/extensions';
import { createTiptapEditor } from '../../../lib/tiptap/createEditor';
import { hasJsonContent } from '../../../lib/tiptap/utils';
import { generateExampleInEditor } from '../../../lib/tiptap/editorHelpers';
import {
  createCheckboxSyncState,
  syncCheckboxWithNode,
  type CheckboxSyncState,
} from '../../../lib/checkboxSync';
import { Recipient } from '../../../lib/types/recipient';
import { 
  computeInitialCheckboxStates, 
  INTRO_NODE_TYPES,
  getContactTypeLabels,
} from '../introEditorUtils';

const noRecipients: Recipient[] = [];

/**
 * Hook for managing the intro message TipTap editor with checkbox sync and store sync
 */
export function useIntroEditor() {
  const { t, i18n } = useTranslation();
  const { getData, setData }: EncryptStoreActions = useEncryptDataStore((state) => {
    const { getData, setData } = state;
    return { getData, setData };
  });

  // Read dynamic data from store (reactive)
  const recipients = useEncryptDataStore((state) => state.who?.recipients ?? noRecipients);
  const conditions = useEncryptDataStore((state) => state.how?.conditions ?? null);
  const threshold = useEncryptDataStore((state) => state.how?.threshold ?? 2);

  // Get initial data (once for initialization)
  const storedDataForInit = getData();
  const initialContent = storedDataForInit.intro?.message ?? null;
  const initialCheckboxState = storedDataForInit.intro?.checkboxState;

  // Local state for editor
  const [messageJson, setMessageJson] = useState<JSONContent | null>(initialContent);
  const [editorVersion, setEditorVersion] = useState(0);

  // Initialize checkbox states
  const initCheckboxes = useMemo(
    () => computeInitialCheckboxStates(initialContent, initialCheckboxState),
    []
  );
  const [checkboxState, setCheckboxState] = useState<IntroCheckboxState>(initCheckboxes);

  // Refs for TipTap
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  // Sync states for checkboxes (refs to persist across renders)
  const recipientsSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, INTRO_NODE_TYPES.recipientsBlock))
  );
  const conditionsSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, INTRO_NODE_TYPES.conditionsBlock))
  );
  const dateTimeSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, INTRO_NODE_TYPES.dateTimeInline))
  );
  const quorumSyncStateRef = useRef<CheckboxSyncState>(
    createCheckboxSyncState(hasNodeTypeInJSON(initialContent, INTRO_NODE_TYPES.quorumInline))
  );

  // Auto-detect presence of components
  const hasRecipientsBlock = useMemo(
    () => hasNodeTypeInJSON(messageJson, INTRO_NODE_TYPES.recipientsBlock),
    [messageJson]
  );
  const hasConditionsBlock = useMemo(
    () => hasNodeTypeInJSON(messageJson, INTRO_NODE_TYPES.conditionsBlock),
    [messageJson]
  );
  const hasDateTimeInline = useMemo(
    () => hasNodeTypeInJSON(messageJson, INTRO_NODE_TYPES.dateTimeInline),
    [messageJson]
  );
  const hasQuorumInline = useMemo(
    () => hasNodeTypeInJSON(messageJson, INTRO_NODE_TYPES.quorumInline),
    [messageJson]
  );

  const hasContent = useMemo(() => hasJsonContent(messageJson), [messageJson]);

  // Checkbox setters
  const setCheckAuthorIdentity = useCallback((value: boolean) => {
    setCheckboxState((prev) => ({ ...prev, authorIdentity: value }));
  }, []);
  const setCheckSecretHolders = useCallback((value: boolean) => {
    setCheckboxState((prev) => ({ ...prev, secretHolders: value }));
  }, []);
  const setCheckOpeningConditions = useCallback((value: boolean) => {
    setCheckboxState((prev) => ({ ...prev, openingConditions: value }));
  }, []);
  const setCheckDated = useCallback((value: boolean) => {
    setCheckboxState((prev) => ({ ...prev, dated: value }));
  }, []);
  const setCheckQuorum = useCallback((value: boolean) => {
    setCheckboxState((prev) => ({ ...prev, quorum: value }));
  }, []);
  const setCheckDirectives = useCallback((value: boolean) => {
    setCheckboxState((prev) => ({ ...prev, directives: value }));
  }, []);

  // Sync checkboxes when components are added/removed
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

  // Contact type labels for dynamic data
  const contactTypeLabels = useMemo(() => getContactTypeLabels(t), [t]);

  /**
   * Update dynamic data via TipTap command (triggers NodeView updates)
   */
  const updateDynamicData = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    editor.commands.setDynamicData({
      recipients: recipients ?? [],
      conditions: conditions ?? null,
      threshold,
      lang: i18n.language as 'fr' | 'en',
      contactTypeLabels,
    });
  }, [recipients, conditions, threshold, i18n.language, contactTypeLabels]);

  // Initialize TipTap editor
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      const newEditor = createTiptapEditor({
        element: editorRef.current,
        content: initialContent,
        placeholder: t('introEditor.placeholder'),
        contentClass: 'tiptap-content',
        enableHeadings: true,
        extensions: [
          DynamicDataExtension,
          RecipientsBlock, 
          ConditionsBlock, 
          DateTimeInline, 
          QuorumInline
        ],
        onUpdate: (json) => {
          setMessageJson(json);
          setEditorVersion((v) => v + 1);
        },
      });
      
      editorInstanceRef.current = newEditor;
      setEditorVersion((v) => v + 1);
      
      // Set initial dynamic data after editor is ready
      setTimeout(() => updateDynamicData(), 0);
    }

    return () => {
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, [t]);

  // Update dynamic content when props change
  useEffect(() => {
    updateDynamicData();
  }, [updateDynamicData]);

  // Auto-save to store
  useEffect(() => {
    setData((_current) => ({
      intro: { message: messageJson, checkboxState }
    }));
  }, [messageJson, checkboxState, setData]);

  // Generate example content
  const generateExample = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    
    const exampleContent = t('introEditor.sidePanel.exampleContentJson', { returnObjects: true }) as JSONContent;
    generateExampleInEditor(editor, exampleContent, hasContent);
    
    setMessageJson(editor.getJSON());
    setEditorVersion((v) => v + 1);
  }, [t, hasContent]);

  // Get current content for navigation
  const getContent = useCallback(() => {
    const editor = editorInstanceRef.current;
    return editor?.getJSON() ?? null;
  }, []);

  return {
    // Editor refs
    editorRef,
    editorInstanceRef,
    editorVersion,
    
    // Content state
    messageJson,
    hasContent,
    
    // Checkbox state
    checkboxState,
    setCheckAuthorIdentity,
    setCheckSecretHolders,
    setCheckOpeningConditions,
    setCheckDated,
    setCheckQuorum,
    setCheckDirectives,
    
    // Node detection
    hasRecipientsBlock,
    hasConditionsBlock,
    hasDateTimeInline,
    hasQuorumInline,
    
    // Dynamic data
    threshold,
    
    // Actions
    generateExample,
    getContent,
  };
}

/** Type for the return value of useIntroEditor hook */
export type UseIntroEditorReturn = ReturnType<typeof useIntroEditor>;
