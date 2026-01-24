import { useState, useMemo, useEffect, useCallback } from 'react';
import { getTranslations, type Language } from '../../lib/i18n';
import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import './RecoveryEditor.css';

interface RecoveryEditorProps {
  lang: Language;
  onContinue: () => void;
  onBack: () => void;
}

export function RecoveryEditor({ lang, onContinue, onBack }: RecoveryEditorProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);
  const [sidePanelOpen, setSidePanelOpen] = useState(() => getInitialSidePanelState('recovery', true));

  // Placeholder state for token input
  const [tokens, setTokens] = useState<string[]>(['']);
  const canContinue = useMemo(() => tokens.some(token => token.trim().length > 0), [tokens]);

  const toggleSidePanel = useCallback(() => {
    setSidePanelOpen(prev => {
      const newState = !prev;
      saveSidePanelState('recovery', newState);
      return newState;
    });
  }, []);

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

  useEffect(() => {
    saveSidePanelState('recovery', sidePanelOpen);
  }, [sidePanelOpen]);

  const sidePanelContent = (
    <>
      <h3>{t.recoveryEditor.sidePanel.title}</h3>
      <p className="intro-text">{t.recoveryEditor.sidePanel.intro}</p>
    </>
  );

  return (
    <EditorLayout
      title={t.recoveryEditor.title}
      subtitle={t.recoveryEditor.subtitle}
      sidePanelOpen={sidePanelOpen}
      collapseLabel={t.recoveryEditor.sidePanel.collapse}
      expandLabel={t.recoveryEditor.sidePanel.expand}
      onToggleSidePanel={toggleSidePanel}
      editorId="recovery"
      sidePanelContent={sidePanelContent}
    >
      <div className="tokens-container">
        {tokens.map((token, index) => (
          <div key={index} className="token-row">
            <span className="token-number">{index + 1}</span>
            <textarea
              className="token-input"
              placeholder={t.recoveryEditor.placeholder}
              value={token}
              onChange={(e) => updateToken(index, e.target.value)}
              rows={3}
            />
            {tokens.length > 1 && (
              <button
                className="remove-token-btn"
                onClick={() => removeToken(index)}
                aria-label="Remove token"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        
        <button className="add-token-btn" onClick={addToken}>
          + Ajouter un jeton
        </button>
      </div>

      <ActionButtons
        onBack={onBack}
        onContinue={handleContinue}
        backLabel={t.common.back}
        continueLabel={t.recoveryEditor.buttons.continue}
        disabled={!canContinue}
      />
    </EditorLayout>
  );
}

export default RecoveryEditor;
