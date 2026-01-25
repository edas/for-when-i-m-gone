import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';
import { defaultSecretCheckboxState } from '../../lib/types/editorTypes';
import { EditorLayout } from '../ui/EditorLayout';
import { CheckboxItem } from '../ui/CheckboxItem';
import { ActionButtons } from '../ui/ActionButtons';
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import formControls from '../../styles/form-controls.module.css';
import styles from './SecretEditor.module.css';

interface SecretEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function SecretEditor({ onContinue, onBack }: SecretEditorProps) {
  const { t } = useTranslation();
  const {getData, setData}:EncryptStoreActions = useEncryptDataStore((state) => {
    const {getData, setData} = state;
    return {getData, setData}
  });
  const initialSecret = getData().what?.content ?? '';
  const [content, setContent] = useState(initialSecret);

  const handleContentChange = useCallback((content: string) => {
    setData((current) => ({
      what: { ...current.what, content: content }
    }));
    setContent(content);
  }, []);

  const handleEditorChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(event.target.value);
  }, [handleContentChange]);
  
  const generateExample = useCallback(() => {
    const example = t('secretEditor.sidePanel.exampleContent');
    handleContentChange(example);
  }, [t, handleContentChange]);

  const isEmpty = content.trim() === '';

  return (
    <EditorLayout title={t('secretEditor.title')}>
      <textarea
        value={content}
        onChange={handleEditorChange}
        autoComplete="off"
        className={formControls.formTextarea}
        placeholder={t('secretEditor.placeholder')}
      />

      <HelpSection title={t('secretEditor.sidePanel.title')}>
        {<HelpContent />}
      </HelpSection>

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={t('common.continue')}
        buttonState={isEmpty ? "none" : "complete"}
        disabled={false}
        onBack={onBack}
        onContinue={onContinue}
        showAlternative={!isEmpty}
        alternativeLabel={t('secretEditor.sidePanel.generateExample')}
        onAlternative={generateExample}
      />
    </EditorLayout>
  );
}

export default SecretEditor;


function HelpContent() {
  const { t } = useTranslation();
  const secretCheckboxState = useEncryptDataStore((state) => state.what?.checkboxState ?? defaultSecretCheckboxState);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const handleCheckboxChange = (key: string, checked: boolean) => {
    setData((current) => ({
      what: { ...current.what, checkboxState: { ...current.what?.checkboxState ?? defaultSecretCheckboxState, [key]: checked } }
    }));
  };
  return (
    <>
      <EssentialSection note={t('secretEditor.sidePanel.essentialNote')}>
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.emails')}
          checked={secretCheckboxState.emails}
          essential
          onChange={(checked) => handleCheckboxChange('emails', checked)}
        />
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.phoneCodes')}
          checked={secretCheckboxState.phoneCodes}
          essential
          onChange={(checked) => handleCheckboxChange('phoneCodes', checked)}
        />
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.cloudAccounts')}
          checked={secretCheckboxState.cloudAccounts}
          essential
          onChange={(checked) => handleCheckboxChange('cloudAccounts', checked)}
        />
      </EssentialSection>

      <div className={styles.regularSection}>
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.computerLogins')}
          checked={secretCheckboxState.computerLogins}
          onChange={(checked) => handleCheckboxChange('computerLogins', checked)}
        />
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.otherPasswords')}
          checked={secretCheckboxState.otherPasswords}
          onChange={(checked) => handleCheckboxChange('otherPasswords', checked)}
        />
      </div>

      <div className={formControls.optionalSection}>
        <h3>{t('secretEditor.sidePanel.sectionOptional')}</h3>
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.domainManager')}
          checked={secretCheckboxState.domainManager}
          onChange={(checked) => handleCheckboxChange('domainManager', checked)}
        />
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.passwordManager')}
          checked={secretCheckboxState.passwordManager}
          onChange={(checked) => handleCheckboxChange('passwordManager', checked)}
        />
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.backups')}
          checked={secretCheckboxState.backups}
          onChange={(checked) => handleCheckboxChange('backups', checked)}
        />
        <CheckboxItem
          label={t('secretEditor.sidePanel.checkboxes.crypto')}
          checked={secretCheckboxState.crypto}
          onChange={(checked) => handleCheckboxChange('crypto', checked)}
        />
      </div>
    </>
  );
}