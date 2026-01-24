import { useMemo, useCallback } from 'react';
import { getTranslations, type Language } from '../../lib/i18n';
import { getStoredData, type AppMode } from '../../lib/dataStore';
import { UnlockEditor } from './UnlockEditor';
import { StepIndicator } from '../ui/StepIndicator';
import './Locked.css';

interface LockedProps {
  lang: Language;
  onUnlocked: (newMode: AppMode) => void;
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
}

export function Locked({ lang, onUnlocked, onBack }: LockedProps) {
  const t = useMemo(() => getTranslations(lang), [lang]);

  // Steps for locked mode
  const steps = useMemo(() => [
    { key: 'unlock', label: t.lockedSteps.unlock },
  ], [t]);

  const handleUnlocked = useCallback(async () => {
    // After successful unlock, get the new mode from stored data
    const newStoredData = getStoredData();
    onUnlocked(newStoredData.mode);
  }, [onUnlocked]);

  return (
    <div className="app-container">
      <StepIndicator steps={steps} currentStep={0} />
      
      <div className="step-content">
        <UnlockEditor
          lang={lang}
          onUnlocked={handleUnlocked}
          onBack={onBack}
        />
      </div>
    </div>
  );
}

export default Locked;
