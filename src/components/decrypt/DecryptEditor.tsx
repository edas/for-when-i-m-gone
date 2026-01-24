import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { HelpSection } from '../ui/HelpSection';
import './DecryptEditor.css';

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
      <div className="decrypt-container">
        {isProcessing ? (
          <div className="status-box processing">
            <div className="spinner"></div>
            <p>{t('decryptEditor.processing')}</p>
          </div>
        ) : errorMessage ? (
          <div className="status-box error">
            <p className="error-title">{t('decryptEditor.error')}</p>
            <p className="error-message">{errorMessage}</p>
          </div>
        ) : decryptedSecret ? (
          <>
            <div className="status-box success">
              <p className="success-title">{t('decryptEditor.success')}</p>
            </div>
            <div className="secret-display">
              <pre>{decryptedSecret}</pre>
            </div>
          </>
        ) : (
          <div className="status-box waiting">
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
