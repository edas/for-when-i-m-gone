import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { HelpSection } from '../ui/HelpSection';
import styles from './DecryptEditor.module.css';

interface DecryptEditorProps {
  onBack: () => void;
}

export function DecryptEditor({ onBack }: DecryptEditorProps) {
  const { t } = useTranslation();

  // Placeholder states for decryption
  const [isProcessing] = useState(false);
  const [decryptedSecret] = useState<string | null>(null);
  const [errorMessage] = useState<string | null>(null);

  const helpContent = (
    <p className="panel-intro">{t('decryptEditor.sidePanel.intro')}</p>
  );

  return (
    <EditorLayout
      title={t('decryptEditor.title')}
      subtitle={t('decryptEditor.subtitle')}
    >
      <div className={styles.decryptContainer}>
        {isProcessing ? (
          <div className={`${styles.statusBox} ${styles.processing}`}>
            <div className={styles.spinner}></div>
            <p>{t('decryptEditor.processing')}</p>
          </div>
        ) : errorMessage ? (
          <div className={`${styles.statusBox} ${styles.error}`}>
            <p className={styles.errorTitle}>{t('decryptEditor.error')}</p>
            <p className={styles.errorMessage}>{errorMessage}</p>
          </div>
        ) : decryptedSecret ? (
          <>
            <div className={`${styles.statusBox} ${styles.success}`}>
              <p className={styles.successTitle}>{t('decryptEditor.success')}</p>
            </div>
            <div className={styles.secretDisplay}>
              <pre>{decryptedSecret}</pre>
            </div>
          </>
        ) : (
          <div className={`${styles.statusBox} ${styles.waiting}`}>
            <p>{t('decryptEditor.subtitle')}</p>
          </div>
        )}
      </div>

      <HelpSection title={t('decryptEditor.sidePanel.title')}>
        {helpContent}
      </HelpSection>

      <ActionButtons
        onBack={onBack}
        onContinue={() => {}}
        backLabel={t('decryptEditor.buttons.back')}
        continueLabel=""
        showContinue={false}
      />
    </EditorLayout>
  );
}

export default DecryptEditor;
