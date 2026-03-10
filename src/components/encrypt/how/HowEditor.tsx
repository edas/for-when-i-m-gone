import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '@/components/ui/EditorLayout';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { HowEditorHelpContent } from './HowEditorHelpContent';
import styles from './HowEditor.module.css';
import { Threshold } from './Threshold';
import { ConditionEditor } from './ConditionEditor';
import { useEncryptDataStore } from '@/lib/dataStore';
import { useConditionEditor } from './useConditionEditor';
import { parseHtmlToJson } from '@/lib/htmlParser';
import { useHowState } from './useHowState';
import { useHowActions } from './useHowActions';

interface HowEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function HowEditor({ onContinue, onBack }: HowEditorProps) {
  const { t } = useTranslation();

  const { setConditions } = useHowActions();
  const content = useEncryptDataStore((state) => state.how?.conditions ?? null);
  const editor = useConditionEditor(content, setConditions);
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