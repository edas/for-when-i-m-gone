import { useState, useMemo, useCallback } from 'react';
import { getTranslations, type Language } from '../../lib/i18n';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { HelpSection } from '../ui/HelpSection';
import './RecoveryEditor.css';

interface RecoveryEditorProps {
  lang: Language;
  onContinue: () => void;
  onBack: () => void;
}

export function RecoveryEditor({ lang, onContinue, onBack }: RecoveryEditorProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);

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
    <p className="panel-intro">{t.recoveryEditor.sidePanel.intro}</p>
  );

  return (
    <EditorLayout
      title={t.recoveryEditor.title}
      subtitle={t.recoveryEditor.subtitle}
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

      <HelpSection title={t.recoveryEditor.sidePanel.title}>
        {helpContent}
      </HelpSection>

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
