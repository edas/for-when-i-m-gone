import { useState, useMemo, useEffect, useCallback, KeyboardEvent } from 'react';
import { getTranslations, type Language } from '../../lib/i18n';
import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
import { 
  getStoredData, 
  decryptExportableData, 
  replaceWithDecryptedData,
  type LockedStoredData
} from '../../lib/dataStore';
import { EditorLayout } from '../ui/EditorLayout';
import './UnlockEditor.css';

interface UnlockEditorProps {
  lang: Language;
  onUnlocked: () => void;
  onBack: () => void;
}

export function UnlockEditor({ lang, onUnlocked, onBack }: UnlockEditorProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);
  const [sidePanelOpen, setSidePanelOpen] = useState(() => getInitialSidePanelState('unlock', true));

  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSidePanel = useCallback(() => {
    setSidePanelOpen(prev => {
      const newState = !prev;
      saveSidePanelState('unlock', newState);
      return newState;
    });
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!password.trim() || isUnlocking) return;

    setIsUnlocking(true);
    setError(null);

    try {
      const storedData = getStoredData();
      if (storedData.mode !== 'locked') {
        throw new Error('Data is not in locked format');
      }

      const lockedData = storedData as LockedStoredData;
      const decryptedData = await decryptExportableData(lockedData, password);
      replaceWithDecryptedData(decryptedData);
      onUnlocked();
    } catch (e) {
      setError(t.unlockEditor.error);
      console.error('Unlock failed:', e);
    } finally {
      setIsUnlocking(false);
    }
  }, [password, isUnlocking, t, onUnlocked]);

  const handleKeydown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && password.trim() && !isUnlocking) {
      handleUnlock();
    }
  }, [password, isUnlocking, handleUnlock]);

  useEffect(() => {
    saveSidePanelState('unlock', sidePanelOpen);
  }, [sidePanelOpen]);

  const sidePanelContent = (
    <>
      <h3>{t.unlockEditor.sidePanel.title}</h3>
      <p className="intro-text">{t.unlockEditor.sidePanel.intro}</p>
    </>
  );

  return (
    <EditorLayout
      title={t.unlockEditor.title}
      subtitle={t.unlockEditor.subtitle}
      sidePanelOpen={sidePanelOpen}
      collapseLabel={t.unlockEditor.sidePanel.collapse}
      expandLabel={t.unlockEditor.sidePanel.expand}
      onToggleSidePanel={toggleSidePanel}
      editorId="unlock"
      sidePanelContent={sidePanelContent}
    >
      <div className="unlock-container">
        <div className="password-field">
          <input
            type="password"
            className="password-input"
            placeholder={t.unlockEditor.placeholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeydown}
            disabled={isUnlocking}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="action-buttons">
          <button
            className="back-btn"
            onClick={onBack}
            disabled={isUnlocking}
          >
            {t.common.back}
          </button>
          <button
            className="unlock-btn"
            onClick={handleUnlock}
            disabled={!password.trim() || isUnlocking}
          >
            {isUnlocking ? t.unlockEditor.unlocking : t.unlockEditor.buttons.unlock}
          </button>
        </div>
      </div>
    </EditorLayout>
  );
}

export default UnlockEditor;
