import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { RichTextToolbar } from '../ui/RichTextToolbar';
import { useIntroEditor } from './intro/useIntroEditor';
import { useIntroState } from './intro/useIntroState';
import { IntroEditorHelpContent } from './intro/IntroEditorHelpContent';
import '../../styles/tiptap-editor.css';
import styles from './IntroMessageEditor.module.css';

interface IntroMessageEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function IntroMessageEditor({ onContinue, onBack }: IntroMessageEditorProps) {
  const { t } = useTranslation();

  const editor = useIntroEditor();
  const { hasContent, variant, canContinue } = useIntroState(editor);

  const generateExample = useCallback(() => {
    editor.generateExample();
  }, [editor.generateExample]);

  return (
    <EditorLayout
      title={t('introEditor.title')}
      subtitle={t('introEditor.subtitle')}
      toolbar={
        <RichTextToolbar editor={editor.editorInstanceRef.current} />
      }
    >
      <div className={`tiptap-editor ${styles.tiptapEditor}`} ref={editor.editorRef}></div>

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
