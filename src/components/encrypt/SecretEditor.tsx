import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { computeButtonState, getButtonText } from '../../lib/buttonState';
import { useData } from '../../lib/DataContext';
import { type SecretCheckboxState } from '../../lib/types/editorTypes';
import { EditorLayout } from '../ui/EditorLayout';
import { CheckboxItem } from '../ui/CheckboxItem';
import { ActionButtons } from '../ui/ActionButtons';
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import { GenerateExampleButton } from '../ui/GenerateExampleButton';
import { Icon } from '../ui/Icons';
import '../../styles/form-controls.css';
import styles from './SecretEditor.module.css';

interface SecretEditorProps {
  initialValue?: string;
  initialCheckboxState?: SecretCheckboxState;
  onContinue: (secret: string, checkboxState: SecretCheckboxState) => void;
  onBack: (secret: string, checkboxState: SecretCheckboxState) => void;
}

export function SecretEditor({ initialValue, initialCheckboxState, onContinue, onBack }: SecretEditorProps) {
  const { updateStoredData } = useData();
  const { t } = useTranslation();
  const [secretText, setSecretText] = useState(initialValue ?? '');

  // Checkbox states
  const [checkEmails, setCheckEmails] = useState(initialCheckboxState?.emails ?? false);
  const [checkPhoneCodes, setCheckPhoneCodes] = useState(initialCheckboxState?.phoneCodes ?? false);
  const [checkCloudAccounts, setCheckCloudAccounts] = useState(initialCheckboxState?.cloudAccounts ?? false);
  const [checkComputerLogins, setCheckComputerLogins] = useState(initialCheckboxState?.computerLogins ?? false);
  const [checkOtherPasswords, setCheckOtherPasswords] = useState(initialCheckboxState?.otherPasswords ?? false);
  const [checkDomainManager, setCheckDomainManager] = useState(initialCheckboxState?.domainManager ?? false);
  const [checkPasswordManager, setCheckPasswordManager] = useState(initialCheckboxState?.passwordManager ?? false);
  const [checkBackups, setCheckBackups] = useState(initialCheckboxState?.backups ?? false);
  const [checkCrypto, setCheckCrypto] = useState(initialCheckboxState?.crypto ?? false);

  const hasContent = useMemo(() => secretText.trim().length > 0, [secretText]);
  const isEmpty = useMemo(() => secretText.trim().length === 0, [secretText]);
  const essentialsChecked = useMemo(() => checkEmails && checkPhoneCodes && checkCloudAccounts, [checkEmails, checkPhoneCodes, checkCloudAccounts]);
  const anyChecked = useMemo(() => 
    checkEmails || checkPhoneCodes || checkCloudAccounts ||
    checkComputerLogins || checkOtherPasswords ||
    checkDomainManager || checkPasswordManager || checkBackups || checkCrypto,
    [checkEmails, checkPhoneCodes, checkCloudAccounts, checkComputerLogins, checkOtherPasswords, checkDomainManager, checkPasswordManager, checkBackups, checkCrypto]
  );

  const buttonState = useMemo(() => computeButtonState(hasContent, anyChecked, essentialsChecked), [hasContent, anyChecked, essentialsChecked]);
  const buttonTexts = useMemo(() => ({
    continueWithoutConfirm: t('secretEditor.buttons.continueWithoutConfirm'),
    continueWithoutEssentials: t('secretEditor.buttons.continueWithoutEssentials'),
    continue: t('secretEditor.buttons.continue'),
  }), [t]);
  const buttonText = useMemo(() => hasContent ? getButtonText(buttonState, buttonTexts) : buttonTexts.continue, [hasContent, buttonState, buttonTexts]);

  const getCurrentCheckboxState = useCallback((): SecretCheckboxState => ({
    emails: checkEmails,
    phoneCodes: checkPhoneCodes,
    cloudAccounts: checkCloudAccounts,
    computerLogins: checkComputerLogins,
    otherPasswords: checkOtherPasswords,
    domainManager: checkDomainManager,
    passwordManager: checkPasswordManager,
    backups: checkBackups,
    crypto: checkCrypto,
  }), [checkEmails, checkPhoneCodes, checkCloudAccounts, checkComputerLogins, checkOtherPasswords, checkDomainManager, checkPasswordManager, checkBackups, checkCrypto]);

  const handleContinue = useCallback(() => {
    if (hasContent) onContinue(secretText, getCurrentCheckboxState());
  }, [hasContent, secretText, getCurrentCheckboxState, onContinue]);

  const handleBack = useCallback(() => {
    onBack(secretText, getCurrentCheckboxState());
  }, [secretText, getCurrentCheckboxState, onBack]);

  const generateExample = useCallback(() => {
    const example = t('secretEditor.sidePanel.exampleContent');
    setSecretText(prev => prev.trim() ? prev + '\n\n\n' + example : example);
  }, [t]);

  // Auto-save
  useEffect(() => {
    updateStoredData((currentData) => ({
      ...currentData,
      what: { content: secretText, checkboxState: getCurrentCheckboxState() }
    }));
  }, [secretText, getCurrentCheckboxState, updateStoredData]);

  const helpContent = (
    <>
      <EssentialSection note={t('secretEditor.sidePanel.essentialNote')}>
        <CheckboxItem
          checked={checkEmails}
          onChange={setCheckEmails}
          label={t('secretEditor.sidePanel.checkboxes.emails')}
          essential
        />
        <CheckboxItem
          checked={checkPhoneCodes}
          onChange={setCheckPhoneCodes}
          label={t('secretEditor.sidePanel.checkboxes.phoneCodes')}
          essential
        />
        <CheckboxItem
          checked={checkCloudAccounts}
          onChange={setCheckCloudAccounts}
          label={t('secretEditor.sidePanel.checkboxes.cloudAccounts')}
          essential
        />
      </EssentialSection>

      <div className="regular-section">
        <CheckboxItem
          checked={checkComputerLogins}
          onChange={setCheckComputerLogins}
          label={t('secretEditor.sidePanel.checkboxes.computerLogins')}
        />
        <CheckboxItem
          checked={checkOtherPasswords}
          onChange={setCheckOtherPasswords}
          label={t('secretEditor.sidePanel.checkboxes.otherPasswords')}
        />
      </div>

      <div className="optional-section">
        <h3>{t('secretEditor.sidePanel.sectionOptional')}</h3>
        <CheckboxItem
          checked={checkDomainManager}
          onChange={setCheckDomainManager}
          label={t('secretEditor.sidePanel.checkboxes.domainManager')}
        />
        <CheckboxItem
          checked={checkPasswordManager}
          onChange={setCheckPasswordManager}
          label={t('secretEditor.sidePanel.checkboxes.passwordManager')}
        />
        <CheckboxItem
          checked={checkBackups}
          onChange={setCheckBackups}
          label={t('secretEditor.sidePanel.checkboxes.backups')}
        />
        <CheckboxItem
          checked={checkCrypto}
          onChange={setCheckCrypto}
          label={t('secretEditor.sidePanel.checkboxes.crypto')}
        />
      </div>
    </>
  );

  return (
    <EditorLayout title={t('secretEditor.title')}>
      <textarea
        autoComplete="off"
        className="form-textarea"
        value={secretText}
        onChange={(e) => setSecretText(e.target.value)}
        placeholder={t('secretEditor.placeholder')}
      />

      <HelpSection title={t('secretEditor.sidePanel.title')}>
        {helpContent}
      </HelpSection>

      {isEmpty ? (
        <div className={styles.buttonContainer}>
          <button className={styles.backButton} onClick={handleBack}>
            <Icon name="arrow-left" size={18} />
            {t('common.back')}
          </button>
          <GenerateExampleButton
            label={t('secretEditor.sidePanel.generateExample')}
            onClick={generateExample}
          />
        </div>
      ) : (
        <ActionButtons
          backLabel={t('common.back')}
          continueLabel={buttonText}
          buttonState={buttonState}
          disabled={!hasContent}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )}
    </EditorLayout>
  );
}

export default SecretEditor;
