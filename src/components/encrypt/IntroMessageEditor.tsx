import { useState, useMemo, useCallback } from 'react';
import type { JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { computeButtonState, getButtonText } from '../../lib/buttonState';
import { type IntroCheckboxState } from '../../lib/types/editorTypes';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { RichTextToolbar } from '../ui/RichTextToolbar';
import { useIntroEditor } from './intro/useIntroEditor';
import { IntroEditorHelpContent } from './intro/IntroEditorHelpContent';
import '../../styles/tiptap-editor.css';
import styles from './IntroMessageEditor.module.css';

interface IntroMessageEditorProps {
  onContinue: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
  onBack: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
}

export function IntroMessageEditor({ onContinue, onBack }: IntroMessageEditorProps) {
  const { t } = useTranslation();
  
  // Hook for editor management
  const editor = useIntroEditor();
  
  // Variant for button
  const [variant, setVariant] = useState<'error' | 'warning' | 'info' | 'success'>('warning');
  
  // Derived state for button
  const { authorIdentity, secretHolders, openingConditions, dated, quorum, directives } = editor.checkboxState;
  const allEssentialsChecked = authorIdentity && secretHolders && openingConditions && dated && quorum;
  const anyChecked = authorIdentity || secretHolders || openingConditions || dated || quorum || directives;

  const buttonState = useMemo(
    () => computeButtonState(editor.hasContent, anyChecked, allEssentialsChecked),
    [editor.hasContent, anyChecked, allEssentialsChecked]
  );
  
  const buttonTexts = useMemo(() => ({
    continueWithoutConfirm: t('introEditor.buttons.continueWithoutConfirm'),
    continueWithoutEssentials: t('introEditor.buttons.continueWithoutEssentials'),
    continue: t('introEditor.buttons.continue'),
  }), [t]);
  
  const buttonText = useMemo(
    () => getButtonText(buttonState, buttonTexts),
    [buttonState, buttonTexts]
  );

  // Handlers
  const handleContinue = useCallback(() => {
    if (editor.hasContent) {
      onContinue(editor.getContent(), editor.checkboxState);
    }
  }, [editor.hasContent, editor.getContent, editor.checkboxState, onContinue]);

  const handleBack = useCallback(() => {
    onBack(editor.getContent(), editor.checkboxState);
  }, [editor.getContent, editor.checkboxState, onBack]);

  // Toolbar labels
  const toolbarLabels = useMemo(() => ({
    heading: t('introEditor.toolbar.heading'),
    paragraph: t('introEditor.toolbar.paragraph'),
    bold: t('introEditor.toolbar.bold'),
    italic: t('introEditor.toolbar.italic'),
    underline: t('introEditor.toolbar.underline'),
    bulletList: t('introEditor.toolbar.bulletList'),
    numberedList: t('introEditor.toolbar.numberedList'),
    insertRecipients: t('introEditor.toolbar.insertRecipients'),
    insertConditions: t('introEditor.toolbar.insertConditions'),
    insertDateTime: t('introEditor.toolbar.insertDateTime'),
    insertQuorum: t('introEditor.toolbar.insertQuorum'),
  }), [t]);

  return (
    <EditorLayout
      title={t('introEditor.title')}
      subtitle={t('introEditor.subtitle')}
      toolbar={
        <RichTextToolbar 
          editor={editor.editorInstanceRef.current} 
          editorVersion={editor.editorVersion} 
          labels={toolbarLabels} 
          threshold={editor.threshold} 
        />
      }
    >
      <div className={`tiptap-editor ${styles.tiptapEditor}`} ref={editor.editorRef}></div>

      <IntroEditorHelpContent editor={editor} onVariantChange={setVariant} />

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={buttonText}
        buttonState={buttonState}
        disabled={!editor.hasContent}
        onBack={handleBack}
        onContinue={handleContinue}
        showAlternative={!editor.hasContent}
        alternativeLabel={t('introEditor.sidePanel.generateExample')}
        onAlternative={editor.generateExample}
        variant={variant}
      />
    </EditorLayout>
  );
}

export default IntroMessageEditor;
