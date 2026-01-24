import { useState, useMemo, useEffect, useCallback } from 'react';
import { getTranslations, type Language } from '../../lib/i18n';
import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import './DecryptEditor.css';

interface DecryptEditorProps {
  lang: Language;
  onBack: () => void;
}

export function DecryptEditor({ lang, onBack }: DecryptEditorProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);
  const [sidePanelOpen, setSidePanelOpen] = useState(() => getInitialSidePanelState('decrypt', true));

  // Placeholder states for decryption
  const [isProcessing] = useState(false);
  const [decryptedSecret] = useState<string | null>(null);
  const [errorMessage] = useState<string | null>(null);

  const toggleSidePanel = useCallback(() => {
    setSidePanelOpen(prev => {
      const newState = !prev;
      saveSidePanelState('decrypt', newState);
      return newState;
    });
  }, []);

  useEffect(() => {
    saveSidePanelState('decrypt', sidePanelOpen);
  }, [sidePanelOpen]);

  const sidePanelContent = (
    <>
      <h3>{t.decryptEditor.sidePanel.title}</h3>
      <p className="intro-text">{t.decryptEditor.sidePanel.intro}</p>
    </>
  );

  return (
    <EditorLayout
      title={t.decryptEditor.title}
      subtitle={t.decryptEditor.subtitle}
      sidePanelOpen={sidePanelOpen}
      collapseLabel={t.decryptEditor.sidePanel.collapse}
      expandLabel={t.decryptEditor.sidePanel.expand}
      onToggleSidePanel={toggleSidePanel}
      editorId="decrypt"
      sidePanelContent={sidePanelContent}
    >
      <div className="decrypt-container">
        {isProcessing ? (
          <div className="status-box processing">
            <div className="spinner"></div>
            <p>{t.decryptEditor.processing}</p>
          </div>
        ) : errorMessage ? (
          <div className="status-box error">
            <p className="error-title">{t.decryptEditor.error}</p>
            <p className="error-message">{errorMessage}</p>
          </div>
        ) : decryptedSecret ? (
          <>
            <div className="status-box success">
              <p className="success-title">{t.decryptEditor.success}</p>
            </div>
            <div className="secret-display">
              <pre>{decryptedSecret}</pre>
            </div>
          </>
        ) : (
          <div className="status-box waiting">
            <p>{t.decryptEditor.subtitle}</p>
          </div>
        )}
      </div>

      <ActionButtons
        onBack={onBack}
        onContinue={() => {}}
        backLabel={t.decryptEditor.buttons.back}
        continueLabel=""
        showContinue={false}
      />
    </EditorLayout>
  );
}

export default DecryptEditor;
