import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../../lib/dataStore';
import { parseHtmlToJson } from '../../../lib/htmlParser';
import { createTiptapEditor } from '../../../lib/tiptap/createEditor';
import { hasJsonContent } from '../../../lib/tiptap/utils';
import { generateExampleInEditor } from '../../../lib/tiptap/editorHelpers';

/**
 * Hook for managing the conditions TipTap editor with direct store sync
 */
export function useConditionsEditor() {
  const { t } = useTranslation();
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  
  // Read from store (source of truth)
  const storedConditions = useEncryptDataStore((state) => state.how?.conditions ?? null);
  const storedIsConditionsUnmodified = useEncryptDataStore((state) => state.how?.isConditionsUnmodified ?? true);
  const storedHasNoOpenConditions = useEncryptDataStore((state) => state.how?.hasNoOpenConditions ?? false);
  
  // Local state for editor (needed for TipTap)
  const [conditionsJson, setConditionsJson] = useState<JSONContent | null>(() => storedConditions);
  const [isConditionsUnmodified, setIsConditionsUnmodified] = useState(() => storedIsConditionsUnmodified);
  const [hasNoOpenConditions, setHasNoOpenConditions] = useState(() => 
    storedIsConditionsUnmodified ? true : storedHasNoOpenConditions
  );
  const [editorVersion, setEditorVersion] = useState(0);
  
  // Refs for TipTap
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const programmaticUpdateRef = useRef(false);

  const hasConditions = useMemo(() => hasJsonContent(conditionsJson), [conditionsJson]);

  const getDefaultConditions = useCallback((): JSONContent => {
    return parseHtmlToJson(t('howEditor.sidePanel.exampleContent'));
  }, [t]);

  // Sync to store whenever local state changes
  useEffect(() => {
    setData((current) => ({
      how: {
        threshold: current.how?.threshold ?? 2,
        conditions: conditionsJson,
        hasNoOpenConditions,
        isConditionsUnmodified,
      }
    }));
  }, [conditionsJson, isConditionsUnmodified, hasNoOpenConditions, setData]);

  // Auto-uncheck when conditions become empty
  useEffect(() => {
    if (!hasConditions && hasNoOpenConditions) {
      setHasNoOpenConditions(false);
    }
  }, [hasConditions, hasNoOpenConditions]);

  // Initialize TipTap editor
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      const editor = createTiptapEditor({
        element: editorRef.current,
        content: conditionsJson,
        placeholder: t('howEditor.conditions.placeholder'),
        contentClass: 'tiptap-content',
        enableHeadings: false,
        onUpdate: (json) => {
          setConditionsJson(json);
          setEditorVersion(v => v + 1);
          if (programmaticUpdateRef.current) return;
          if (isConditionsUnmodified) {
            setIsConditionsUnmodified(false);
            setHasNoOpenConditions(false);
          }
        },
      });
      
      editorInstanceRef.current = editor;
    }

    return () => {
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, [t]); // Re-run if language changes

  const generateExample = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    const exampleContent = getDefaultConditions();

    programmaticUpdateRef.current = true;

    generateExampleInEditor(editor, exampleContent, hasConditions);
    
    if (!hasConditions) {
      setIsConditionsUnmodified(true);
      setHasNoOpenConditions(true);
    }
    
    setConditionsJson(editor.getJSON());
    setEditorVersion(v => v + 1);
    
    requestAnimationFrame(() => { 
      programmaticUpdateRef.current = false; 
    });
  }, [getDefaultConditions, hasConditions]);

  const updateHasNoOpenConditions = useCallback((value: boolean) => {
    setHasNoOpenConditions(value);
  }, []);

  return {
    editorRef,
    editorInstanceRef,
    hasConditions,
    isConditionsUnmodified,
    hasNoOpenConditions,
    setHasNoOpenConditions: updateHasNoOpenConditions,
    generateExample,
    editorVersion,
  };
}
