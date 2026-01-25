import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';
import { computeButtonStateCustom } from '../../lib/buttonState';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { RichTextToolbar } from '../ui/RichTextToolbar';
import { Icon } from '../ui/Icons';
import { getDefaultThreshold, parseThreshold, computeHowDerivedState } from './howEditorUtils';
import { useConditionsEditor } from './how/useConditionsEditor';
import { HowEditorHelpContent } from './how/HowEditorHelpContent';
import '../../styles/tiptap-editor.css';
import styles from './HowEditor.module.css';

interface HowEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function HowEditor({ onContinue, onBack }: HowEditorProps) {
  const { t } = useTranslation();
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const recipientCount = useEncryptDataStore((state) => state.who?.recipients?.length ?? 0);
  const aesKey = useEncryptDataStore((state) => state.generate?.aesKey);
  
  // Threshold: read from store + local state for input (parsing)
  const storedThreshold = useEncryptDataStore((state) => state.how?.threshold);
  const [inputValue, setInputValue] = useState(() => 
    String(storedThreshold ?? getDefaultThreshold(recipientCount))
  );
  const threshold = parseThreshold(inputValue);
  
  // Sync threshold to store when it changes
  useEffect(() => {
    if (threshold !== null) {
      setData((current) => ({ 
        how: { 
          conditions: current.how?.conditions ?? null,
          hasNoOpenConditions: current.how?.hasNoOpenConditions ?? false,
          ...current.how, 
          threshold 
        } 
      }));
    }
  }, [threshold, setData]);
  
  // Hook for conditions editor (manages its own state + store sync)
  const editor = useConditionsEditor();
  
  // Compute derived state (pure function)
  const derived = useMemo(() => 
    computeHowDerivedState(threshold, recipientCount, editor.hasConditions),
    [threshold, recipientCount, editor.hasConditions]
  );

  // Check if AES key is already generated (read-only mode)
  const isAesKeyGenerated = aesKey instanceof Uint8Array;

  // Variant for button
  const [variant, setVariant] = useState<'error' | 'warning' | 'info' | 'success'>('error');

  // Button state
  const buttonState = useMemo(
    () => computeButtonStateCustom(derived.canContinue, derived.allEssentialsChecked),
    [derived.canContinue, derived.allEssentialsChecked]
  );
  const buttonText = t('howEditor.buttons.continue');

  // Handlers
  const handleContinue = useCallback(() => {
    if (derived.canContinue) onContinue();
  }, [derived.canContinue, onContinue]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const increment = useCallback(() => {
    const current = threshold ?? 1;
    if (current < recipientCount) setInputValue(String(current + 1));
  }, [threshold, recipientCount]);

  const decrement = useCallback(() => {
    const current = threshold ?? 3;
    if (current > 2) setInputValue(String(current - 1));
  }, [threshold]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const toolbarLabels = useMemo(() => ({
    bold: t('howEditor.toolbar.bold'),
    italic: t('howEditor.toolbar.italic'),
    underline: t('howEditor.toolbar.underline'),
    bulletList: t('howEditor.toolbar.bulletList'),
    numberedList: t('howEditor.toolbar.numberedList'),
  }), [t]);

  return (
    <EditorLayout title={t('howEditor.title')}>
      <div className={styles.howContent}>
        {/* Threshold Section */}
        <section className={styles.thresholdSection}>
          
          <p className={styles.sectionSubtitle}>{t('howEditor.threshold.subtitle')}</p>
          
          <div className={styles.thresholdContent}>
            <div className={styles.inputSection}>
              <div className={styles.numberInputWrapper}>
                <button 
                  className={styles.numberButton} 
                  onClick={decrement}
                  disabled={isAesKeyGenerated || threshold === null || threshold <= 2}
                  aria-label="Decrease"
                >
                  <Icon name="minus" size={24} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`${styles.numberInput} ${derived.isError ? styles.error : ''} ${derived.isGreen ? styles.optimal : ''}`}
                  value={inputValue}
                  onChange={handleInputChange}
                  readOnly={isAesKeyGenerated}
                />
                <button 
                  className={styles.numberButton} 
                  onClick={increment}
                  disabled={isAesKeyGenerated || (threshold !== null && threshold >= recipientCount)}
                  aria-label="Increase"
                >
                  <Icon name="plus" size={24} />
                </button>
              </div>
              <span className={styles.recipientInfo}>
                {t('howEditor.threshold.outOf', { count: recipientCount })}
              </span>
            </div>

            <div className={styles.quorumWarningInline}>
              <div className={styles.warningIcon}>
                <Icon name="alert-triangle" size={20} />
              </div>
              <p className={styles.warningText}>{t('howEditor.sidePanel.quorumWarning')}</p>
            </div>
          </div>

          {derived.isOne && (
            <div className={styles.errorMessage}>
              <Icon name="alert-triangle" size={20} />
              <p>{t('howEditor.threshold.errorOne')}</p>
            </div>
          )}
        </section>

        {/* Conditions Section */}
        <section className={styles.conditionsSection}>
          <label className={styles.sectionSubtitle}>
            {t('howEditor.conditions.title')}
          </label>
          
          <div className={styles.editorWrapper}>
            <RichTextToolbar 
              editor={editor.editorInstanceRef.current} 
              labels={toolbarLabels} 
              compact 
              editorVersion={editor.editorVersion}
            />
            <div className="tiptap-editor compact" ref={editor.editorRef}></div>
          </div>
        </section>
      </div>

      <HowEditorHelpContent
        derived={derived}
        hasConditions={editor.hasConditions}
        hasNoOpenConditions={editor.hasNoOpenConditions}
        onHasNoOpenConditionsChange={editor.setHasNoOpenConditions}
        recipientCount={recipientCount}
        onVariantChange={setVariant}
      />

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={buttonText}
        buttonState={buttonState}
        disabled={!derived.canContinue}
        onBack={handleBack}
        onContinue={handleContinue}
        alternativeLabel={t('howEditor.sidePanel.generateExample')}
        showAlternative={!editor.hasConditions}
        onAlternative={editor.generateExample}
        variant={variant}
      />
    </EditorLayout>
  );
}

export default HowEditor;
