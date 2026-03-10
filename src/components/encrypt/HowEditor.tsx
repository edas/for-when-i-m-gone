import { useCallback,  } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { HowEditorHelpContent } from './how/HowEditorHelpContent';
// import '../../styles/tiptap-editor.css';
import styles from './HowEditor.module.css';
import { Threshold } from './how/Threshold';
import { ConditionEditor } from './how/ConditionEditor';
import { useEncryptDataStore } from '@/lib/dataStore';
import { useConditionEditor } from './how/useConditionEditor';
import { parseHtmlToJson } from '@/lib/htmlParser';
import { useHowState } from './how/useHowState';

interface HowEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function HowEditor({ onContinue, onBack }: HowEditorProps) {
  const { t } = useTranslation();
  
  const content = useEncryptDataStore((state) => state.how?.conditions ?? null);
  const editor = useConditionEditor(content);
  const { hasConditions, variant, canContinue } = useHowState(editor);
  const generateExample = useCallback(() => {
    if (!editor) return ;
    const exampleContent = parseHtmlToJson(t('howEditor.sidePanel.exampleContent'));
    editor.commands.setContent(exampleContent);
  }, [t, editor]);


  return (
    <EditorLayout title={t('howEditor.title')}>
      <div className={styles.howContent}>
        <Threshold />

        <ConditionEditor editor={editor} />
      </div>

      <HowEditorHelpContent editor={editor} />

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={t('howEditor.buttons.continue')}
        buttonState={"complete"}
        disabled={!canContinue}
        onBack={onBack}
        onContinue={onContinue}
        alternativeLabel={t('howEditor.sidePanel.generateExample')}
        showAlternative={!hasConditions}
        onAlternative={generateExample}
        variant={variant}
      />
    </EditorLayout>
  );
}

export default HowEditor;