import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { HelpSection } from '../ui/HelpSection';
import styles from './RecoveryEditor.module.css';

interface RecoveryEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function RecoveryEditor({ onContinue, onBack }: RecoveryEditorProps) {
  const { t } = useTranslation();

  // Placeholder state for token input
  const [tokens, setTokens] = useState<string[]>(['']);
  const canContinue = useMemo(() => tokens.some(token => token.trim().length > 0), [tokens]);

  const addToken = useCallback(() => {
    setTokens(prev => [...prev, '']);
  }, []);

  const removeToken = useCallback((index: number) => {
    setTokens(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateToken = useCallback((index: number, value: string) => {
    setTokens(prev => prev.map((t, i) => i === index ? value : t));
  }, []);

  const handleContinue = useCallback(() => {
    if (canContinue) {
      onContinue();
    }
  }, [canContinue, onContinue]);

  const helpContent = (
    <p className="panel-intro">{t('recoveryEditor.sidePanel.intro')}</p>
  );

  return (
    <EditorLayout
      title={t('recoveryEditor.title')}
      subtitle={t('recoveryEditor.subtitle')}
    >
      <div className={styles.tokensContainer}>
        {tokens.map((token, index) => (
          <div key={index} className={styles.tokenRow}>
            <span className={styles.tokenNumber}>{index + 1}</span>
            <textarea
              className={styles.tokenInput}
              placeholder={t('recoveryEditor.placeholder')}
              value={token}
              onChange={(e) => updateToken(index, e.target.value)}
              rows={3}
            />
            {tokens.length > 1 && (
              <button
                className={styles.removeTokenBtn}
                onClick={() => removeToken(index)}
                aria-label="Remove token"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        
        <button className={styles.addTokenBtn} onClick={addToken}>
          + Ajouter un jeton
        </button>
      </div>

      <HelpSection title={t('recoveryEditor.sidePanel.title')}>
        {helpContent}
      </HelpSection>

      <ActionButtons
        onBack={onBack}
        onContinue={handleContinue}
        backLabel={t('common.back')}
        continueLabel={t('recoveryEditor.buttons.continue')}
        disabled={!canContinue}
      />
    </EditorLayout>
  );
}

export default RecoveryEditor;
