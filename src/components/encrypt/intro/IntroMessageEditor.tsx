import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorState } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { EditorLayout } from '@/components/ui/EditorLayout';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { useIntroEditor } from './useIntroEditor';
import { useIntroState } from './useIntroState';
import { IntroEditor } from './IntroEditor';
import { IntroEditorHelpContent } from './IntroEditorHelpContent';
import styles from './IntroMessageEditor.module.css';
import { useEncryptDataStore, type EncryptStoreActions } from '@/lib/dataStore';
import { generateExampleInEditor } from '@/lib/tiptap/editorHelpers';

interface IntroMessageEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function IntroMessageEditor({ onContinue, onBack }: IntroMessageEditorProps) {
  const { t } = useTranslation();
  const editor = useIntroEditor();
  const { hasContent, variant, canContinue } = useIntroState(editor);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const threshold = useEncryptDataStore((state) => state.how?.threshold ?? 2);
  const messageJson = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => (currentEditor ? currentEditor.getJSON() : null),
  }) ?? null;

  useEffect(() => {
    setData((current) => ({
      intro: {
        ...current.intro,
        message: messageJson,
      },
    }));
  }, [messageJson, setData]);

  const generateExample = useCallback(() => {
    if (!editor) return;
    const exampleContent = t('introEditor.sidePanel.exampleContentJson', { returnObjects: true }) as JSONContent;
    generateExampleInEditor(editor, exampleContent, hasContent, {
      quorum: threshold,
      date: new Date(),
    });
  }, [editor, t, hasContent, threshold]);

  return (
    <EditorLayout
      title={t('introEditor.title')}
    >
      <div className={styles.introContent}>
        <IntroEditor editor={editor} />
      </div>
      <IntroEditorHelpContent editor={editor} />

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={t('introEditor.buttons.continue')}
        buttonState="complete"
        disabled={!canContinue}
        onBack={onBack}
        onContinue={onContinue}
        showAlternative={!hasContent}
        alternativeLabel={t('introEditor.sidePanel.generateExample')}
        onAlternative={generateExample}
        variant={variant}
      />
    </EditorLayout>
  );
}