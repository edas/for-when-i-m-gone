import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';
import { defaultSecretCheckboxState, SecretCheckboxState } from '../../lib/types/editorTypes';
import { EditorLayout } from '../ui/EditorLayout';
import { CheckboxItem } from '../ui/CheckboxItem';
import { ActionButtons } from '../ui/ActionButtons';
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import formControls from '../../styles/form-controls.module.css';
import styles from './SecretEditor.module.css';
import { TFunction } from 'i18next';

interface SecretEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function SecretEditor({ onContinue, onBack }: SecretEditorProps) {
  const { t } = useTranslation();
  const getData: EncryptStoreActions['getData'] = useEncryptDataStore(state => state.getData);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore(state => state.setData);
  const initialSecret = getData().what?.content ?? '';
  const [content, setContent] = useState(initialSecret);
  const checkboxState = useEncryptDataStore((state) => state.what?.checkboxState ?? defaultSecretCheckboxState);

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
  
  // Calculer la variante pour le bouton
  const essentials = [
    checkboxState.emails,
    checkboxState.phoneCodes,
    checkboxState.cloudAccounts
  ];
  const optional = [
    checkboxState.computerLogins,
    checkboxState.otherPasswords,
    checkboxState.domainManager,
    checkboxState.passwordManager,
    checkboxState.backups,
    checkboxState.crypto
  ];
  const { variant, title } = getVariantAndTitle(content, essentials, optional, t);

  return (
    <EditorLayout title={t('secretEditor.title')}>
      <textarea
        value={content}
        onChange={handleEditorChange}
        autoComplete="off"
        className={formControls.formTextarea}
        placeholder={t('secretEditor.placeholder')}
      />

      
      <HelpContent title={title}/>

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={t('common.continue')}
        buttonState={isEmpty ? "none" : "complete"}
        disabled={false}
        onBack={onBack}
        onContinue={onContinue}
        showAlternative={isEmpty}
        alternativeLabel={t('secretEditor.sidePanel.generateExample')}
        onAlternative={generateExample}
        variant={variant}
      />
    </EditorLayout>
  );
}


function getVariantAndTitle(content: string, essentials: boolean[], optional: boolean[], t: TFunction): { variant: 'error' | 'warning' | 'info' | 'success', title: string } {
  const isEmpty = content.trim() === '';
  const essentialCount = essentials.filter(Boolean).length;
  const essentialTotal = essentials.length;
  const allCheckedCount = essentialCount + optional.filter(Boolean).length;
  const allTotal = essentialTotal + optional.length;
  const allChecked = allCheckedCount === allTotal;
  const allEssentialChecked = essentialCount === essentialTotal;

  if (allChecked) {
    return {
      variant: 'success',
      title: t('secretEditor.sidePanel.successTitle', { count: allCheckedCount, total: allTotal })
    };
  }
  if (allEssentialChecked) {
    return {
      variant: 'info',
      title: t('secretEditor.sidePanel.infoTitle', { count: allCheckedCount, total: allTotal })
    };
  }
  if (isEmpty) {
    return {
      variant: 'error',
      title: t('secretEditor.sidePanel.errorTitle')
    };
  }
  return {
    variant: 'warning',
    title: t('secretEditor.sidePanel.warningTitle', { count: essentialCount, total: essentialTotal })
  };
}

function HelpContent({ title }: { title: string }) {
  const { t } = useTranslation();
  const checkboxState = useEncryptDataStore((state) => state.what?.checkboxState ?? defaultSecretCheckboxState);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  
  const handleCheckboxChange = (key: string, checked: boolean) => {
    setData((current) => ({
      what: { ...current.what, checkboxState: { ...current.what?.checkboxState ?? defaultSecretCheckboxState, [key]: checked } }
    }));
  };

  return (
    <HelpSection title={title}>
      <EssentialSection note={t('secretEditor.sidePanel.essentialNote')}>
        <CheckBox name="emails" state={checkboxState.emails} essential={true} handleCheckboxChange={handleCheckboxChange} />
        <CheckBox name="phoneCodes" state={checkboxState.phoneCodes} essential={true} handleCheckboxChange={handleCheckboxChange} />
        <CheckBox name="cloudAccounts" state={checkboxState.cloudAccounts} essential={true} handleCheckboxChange={handleCheckboxChange} />
      </EssentialSection>

      <div className={styles.regularSection}>
        <CheckBox name="computerLogins" state={checkboxState.computerLogins} essential={false} handleCheckboxChange={handleCheckboxChange} />
        <CheckBox name="otherPasswords" state={checkboxState.otherPasswords} essential={false} handleCheckboxChange={handleCheckboxChange} />
      </div>

      <div className={formControls.optionalSection}>
        <h3>{t('secretEditor.sidePanel.sectionOptional')}</h3>
        <CheckBox name="domainManager" state={checkboxState.domainManager} essential={false} handleCheckboxChange={handleCheckboxChange} />
        <CheckBox name="passwordManager" state={checkboxState.passwordManager} essential={false} handleCheckboxChange={handleCheckboxChange} />
        <CheckBox name="backups" state={checkboxState.backups} essential={false} handleCheckboxChange={handleCheckboxChange} />
        <CheckBox name="crypto" state={checkboxState.crypto} essential={false} handleCheckboxChange={handleCheckboxChange} />
      </div>
    </HelpSection>
  );
}

function CheckBox({ name, state, essential, handleCheckboxChange }: { name: keyof SecretCheckboxState, state: SecretCheckboxState, essential: boolean, handleCheckboxChange: (name: keyof SecretCheckboxState, checked: boolean) => void }) {
  const { t } = useTranslation();
  return (
    <CheckboxItem
      label={t(`secretEditor.sidePanel.checkboxes.${name}`)}
      checked={state[name]}
      essential={essential}
      onChange={(checked) => handleCheckboxChange(name, checked)}
    />
  );
}