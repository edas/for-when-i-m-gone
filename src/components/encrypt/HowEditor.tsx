import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Editor, JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';
import { computeButtonStateCustom, getButtonText } from '../../lib/buttonState';
import { type HowData } from '../../lib/types/editorTypes';
import { parseHtmlToJson } from '../../lib/htmlParser';
import { createTiptapEditor } from '../../lib/tiptap/createEditor';
import { hasJsonContent } from '../../lib/tiptap/utils';
import { generateExampleInEditor } from '../../lib/tiptap/editorHelpers';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import { CheckboxItem } from '../ui/CheckboxItem';
import { TipSection } from '../ui/TipSection';
import { RichTextToolbar } from '../ui/RichTextToolbar';
import { Icon } from '../ui/Icons';
import '../../styles/tiptap-editor.css';
import formControls from '../../styles/form-controls.module.css';
import styles from './HowEditor.module.css';

interface HowEditorProps {
  onContinue: (data: HowData) => void;
  onBack: (data: HowData) => void;
}

function getDefaultThreshold(count: number): number {
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function HowEditor({ onContinue, onBack }: HowEditorProps) {
  const { t } = useTranslation();
  const getData: EncryptStoreActions['getData'] = useEncryptDataStore((state) => state.getData);
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const recipientCount = useEncryptDataStore((state) => state.who?.recipients?.length ?? 0);
  const aesKey = useEncryptDataStore((state) => state.generate?.aesKey);
  
  // Récupérer les données initiales une seule fois pour l'initialisation des états
  const storedDataForInit = getData();

  const getDefaultConditions = useCallback((): JSONContent => {
    return parseHtmlToJson(t('howEditor.sidePanel.exampleContent'));
  }, [t]);

  // State
  const [inputValue, setInputValue] = useState(() => {
    const initData = storedDataForInit.how;
    const initRecipientCount = storedDataForInit.who?.recipients?.length ?? 0;
    return initData?.threshold !== undefined 
      ? String(initData.threshold) 
      : String(getDefaultThreshold(initRecipientCount));
  });
  const [conditionsJson, setConditionsJson] = useState<JSONContent | null>(() => 
    storedDataForInit.how?.conditions ?? null
  );
  const [isConditionsUnmodified, setIsConditionsUnmodified] = useState(() => {
    const initData = storedDataForInit.how;
    return initData?.isConditionsUnmodified ?? !initData?.conditions;
  });
  const [hasNoOpenConditions, setHasNoOpenConditions] = useState(() => {
    const initData = storedDataForInit.how;
    const initIsUnmodified = initData?.isConditionsUnmodified ?? !initData?.conditions;
    return initIsUnmodified ? true : (initData?.hasNoOpenConditions ?? false);
  });
  const [editorVersion, setEditorVersion] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const programmaticUpdateRef = useRef(false);

  // Parse threshold input
  const parsedValue = useMemo(() => {
    const trimmed = inputValue.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num) || !Number.isInteger(num)) return null;
    return num;
  }, [inputValue]);

  const threshold = parsedValue;
  const isValidNumber = threshold !== null;
  const isOne = threshold === 1;
  const isValidThreshold = threshold !== null && threshold >= 2;
  const isTooHigh = threshold !== null && threshold > recipientCount;
  const isLowerThanRecipientCount = threshold !== null && threshold < recipientCount;

  const hasConditions = useMemo(() => hasJsonContent(conditionsJson), [conditionsJson]);

  const allEssentialsChecked = useMemo(() => 
    isValidThreshold && 
    (recipientCount <= 2 || isLowerThanRecipientCount) && 
    hasConditions,
    [isValidThreshold, recipientCount, isLowerThanRecipientCount, hasConditions]
  );

  const isAtLeast3 = threshold !== null && threshold >= 3;
  const isAtMost5 = threshold !== null && threshold <= 5;

  const isError = !isValidNumber || (threshold !== null && (threshold < 2 || threshold > recipientCount));
  const isGreen = threshold !== null && threshold >= 3 && threshold <= 5 && threshold < recipientCount;

  const canContinue = isValidThreshold && !isTooHigh;

  // Check if AES key is already generated
  const isAesKeyGenerated = aesKey instanceof Uint8Array;

  const buttonState = useMemo(() => computeButtonStateCustom(canContinue, allEssentialsChecked), [canContinue, allEssentialsChecked]);
  const buttonTexts = useMemo(() => ({
    continueWithoutEssentials: t('howEditor.buttons.continueWithoutEssentials'),
    continue: t('howEditor.buttons.continue'),
  }), [t]);
  const buttonText = useMemo(() => getButtonText(buttonState, buttonTexts), [buttonState, buttonTexts]);

  const getCurrentData = useCallback((): HowData => ({
    threshold: threshold ?? getDefaultThreshold(recipientCount),
    conditions: conditionsJson,
    hasNoOpenConditions,
    isConditionsUnmodified,
  }), [threshold, recipientCount, conditionsJson, hasNoOpenConditions, isConditionsUnmodified]);

  const handleContinue = useCallback(() => {
    if (canContinue) onContinue(getCurrentData());
  }, [canContinue, getCurrentData, onContinue]);

  const handleBack = useCallback(() => {
    onBack(getCurrentData());
  }, [getCurrentData, onBack]);

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

  const generateExample = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;
    const exampleContent = getDefaultConditions();

    programmaticUpdateRef.current = true;

    generateExampleInEditor(editor, exampleContent, hasConditions);
    
    if (!hasConditions) {
      setIsConditionsUnmodified(true);
      setHasNoOpenConditions(true);
    }
    
    setConditionsJson(editor.getJSON());
    setEditorVersion(v => v + 1);
    
    requestAnimationFrame(() => { 
      programmaticUpdateRef.current = false; 
    });
  }, [getDefaultConditions, hasConditions]);

  // Auto-uncheck when conditions become empty
  useEffect(() => {
    if (!hasConditions && hasNoOpenConditions) {
      setHasNoOpenConditions(false);
    }
  }, [hasConditions, hasNoOpenConditions]);

  // Initialize TipTap editor
  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      const editor = createTiptapEditor({
        element: editorRef.current,
        content: conditionsJson,
        placeholder: t('howEditor.conditions.placeholder'),
        contentClass: 'tiptap-content',
        enableHeadings: false,
        onUpdate: (json) => {
          setConditionsJson(json);
          setEditorVersion(v => v + 1);
          if (programmaticUpdateRef.current) return;
          if (isConditionsUnmodified) {
            setIsConditionsUnmodified(false);
            setHasNoOpenConditions(false);
          }
        },
      });
      
      editorInstanceRef.current = editor;
    }

    return () => {
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, [t]); // Re-run if language changes

  // Auto-save
  useEffect(() => {
    setData((_current) => ({
      how: getCurrentData()
    }));
  }, [getCurrentData, setData]);

  const toolbarLabels = useMemo(() => ({
    bold: t('howEditor.toolbar.bold'),
    italic: t('howEditor.toolbar.italic'),
    underline: t('howEditor.toolbar.underline'),
    bulletList: t('howEditor.toolbar.bulletList'),
    numberedList: t('howEditor.toolbar.numberedList'),
  }), [t]);

  const helpContent = (
    <>
      <EssentialSection note={t('howEditor.sidePanel.essentialNote')}>
        <CheckboxItem
          checked={isValidThreshold && !isTooHigh}
          label={t('howEditor.sidePanel.checklist.validThreshold')}
          readonly
        />
        <CheckboxItem
          checked={isLowerThanRecipientCount}
          label={t('howEditor.sidePanel.checklist.lowerThanRecipientCount')}
          description={t('howEditor.sidePanel.checklist.lowerThanRecipientCountHelp')}
          strikethrough={recipientCount <= 2}
          readonly
        />
        <CheckboxItem
          checked={hasConditions}
          label={t('howEditor.sidePanel.checklist.hasConditions')}
          readonly
        />
      </EssentialSection>

      <div className={formControls.optionalSection}>
        <CheckboxItem
          checked={isAtLeast3}
          label={t('howEditor.sidePanel.checklist.atLeast3')}
          description={t('howEditor.sidePanel.checklist.atLeast3Help')}
          strikethrough={recipientCount <= 2}
          readonly
        />
        <CheckboxItem
          checked={isAtMost5}
          label={t('howEditor.sidePanel.checklist.atMost5')}
          description={t('howEditor.sidePanel.checklist.atMost5Help')}
          readonly
        />
        <CheckboxItem
          checked={hasNoOpenConditions}
          onChange={setHasNoOpenConditions}
          label={t('howEditor.sidePanel.checklist.hasNoOpenConditions')}
          readonly={!hasConditions}
        />
      </div>

      <TipSection text={t('howEditor.sidePanel.tip')} />
    </>
  );

  return (
    <EditorLayout title={t('howEditor.title')}>
      <div className={styles.howContent}>
        {/* Threshold Section */}
        <section className={styles.thresholdSection}>
          <h2 className={styles.sectionTitle}>{t('howEditor.threshold.title')}</h2>
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
                  className={`${styles.numberInput} ${isError ? styles.error : ''} ${isGreen ? styles.optimal : ''}`}
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

          {isOne && (
            <div className={styles.errorMessage}>
              <Icon name="alert-triangle" size={20} />
              <p>{t('howEditor.threshold.errorOne')}</p>
            </div>
          )}
        </section>

        {/* Conditions Section */}
        <section className={styles.conditionsSection}>
          <label className={styles.conditionLabel}>
            <Icon name="info" size={20} />
            {t('howEditor.conditions.title')}
          </label>
          
          <div className={styles.editorWrapper}>
            <RichTextToolbar 
              editor={editorInstanceRef.current} 
              labels={toolbarLabels} 
              compact 
              editorVersion={editorVersion}
            />
            <div className="tiptap-editor compact" ref={editorRef}></div>
          </div>
        </section>
      </div>

      <HelpSection title={t('howEditor.sidePanel.title')}>
        {helpContent}
      </HelpSection>

      <ActionButtons
        backLabel={t('common.back')}
        continueLabel={buttonText}
        buttonState={buttonState}
        disabled={!canContinue}
        onBack={handleBack}
        onContinue={handleContinue}
        alternativeLabel={t('howEditor.sidePanel.generateExample')}
        showAlternative={!hasConditions}
        onAlternative={generateExample}
      />
    </EditorLayout>
  );
}

export default HowEditor;
