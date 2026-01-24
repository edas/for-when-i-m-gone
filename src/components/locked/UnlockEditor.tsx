import { useState, useCallback, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../lib/DataContext';
import { 
  decryptExportableData, 
  replaceWithDecryptedData,
  type LockedStoredData
} from '../../lib/dataStore';
import { EditorLayout } from '../ui/EditorLayout';
import { HelpSection } from '../ui/HelpSection';
import styles from './UnlockEditor.module.css';

interface UnlockEditorProps {
  onUnlocked: () => void;
  onBack: () => void;
}

export function UnlockEditor({ onUnlocked, onBack }: UnlockEditorProps) {
  const { storedData } = useData();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = useCallback(async () => {
    if (!password.trim() || isUnlocking) return;

    setIsUnlocking(true);
    setError(null);

    try {
      if (storedData.mode !== 'locked') {
        throw new Error('Data is not in locked format');
      }

      const lockedData = storedData as LockedStoredData;
      const decryptedData = await decryptExportableData(lockedData, password);
      replaceWithDecryptedData(decryptedData);
      onUnlocked();
    } catch (e) {
      setError(t('unlockEditor.error'));
      console.error('Unlock failed:', e);
    } finally {
      setIsUnlocking(false);
    }
  }, [password, isUnlocking, t, onUnlocked, storedData]);

  const handleKeydown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && password.trim() && !isUnlocking) {
      handleUnlock();
    }
  }, [password, isUnlocking, handleUnlock]);

  const helpContent = (
    <p className="panel-intro">{t('unlockEditor.sidePanel.intro')}</p>
  );

  return (
    <EditorLayout
      title={t('unlockEditor.title')}
      subtitle={t('unlockEditor.subtitle')}
    >
      <div className={styles.unlockContainer}>
        <div className={styles.passwordField}>
          <input
            type="password"
            className={styles.passwordInput}
            placeholder={t('unlockEditor.placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeydown}
            disabled={isUnlocking}
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <HelpSection title={t('unlockEditor.sidePanel.title')}>
          {helpContent}
        </HelpSection>

        <div className={styles.actionButtons}>
          <button
            className={styles.backBtn}
            onClick={onBack}
            disabled={isUnlocking}
          >
            {t('common.back')}
          </button>
          <button
            className={styles.unlockBtn}
            onClick={handleUnlock}
            disabled={!password.trim() || isUnlocking}
          >
            {isUnlocking ? t('unlockEditor.unlocking') : t('unlockEditor.buttons.unlock')}
          </button>
        </div>
      </div>
    </EditorLayout>
  );
}

export default UnlockEditor;
