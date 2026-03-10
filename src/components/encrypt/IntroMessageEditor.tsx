import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorState } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { useIntroEditor } from './intro/useIntroEditor';
import { useIntroState } from './intro/useIntroState';
import { IntroEditor } from './intro/IntroEditor';
import { IntroEditorHelpContent } from './intro/IntroEditorHelpContent';
import styles from './IntroMessageEditor.module.css';
import { useEncryptDataStore, type EncryptStoreActions } from '../../lib/dataStore';
import { defaultIntroCheckboxState } from '../../lib/types/editorTypes';
import { generateExampleInEditor } from '../../lib/tiptap/editorHelpers';

interface IntroMessageEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function IntroMessageEditor({ onContinue, onBack }: IntroMessageEditorProps) {
  const { t } = useTranslation();
  const editor = useIntroEditor();
  const { hasContent, variant, canContinue } = useIntroState(editor);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const checkboxState = useEncryptDataStore((state) => state.intro?.checkboxState ?? defaultIntroCheckboxState);
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
        checkboxState,
      },
    }));
  }, [messageJson, checkboxState, setData]);

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

export default IntroMessageEditor;