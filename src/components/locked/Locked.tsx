import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { UnlockEditor } from './UnlockEditor';
import { StepIndicator } from '../ui/StepIndicator';
import './Locked.css';

interface LockedProps {
  onUnlocked: () => void;
  onBack: () => void;
}

export function Locked({ onUnlocked, onBack }: LockedProps) {
  const { t } = useTranslation();

  // Steps for locked mode
  const steps = useMemo(() => [
    { key: 'unlock', label: t('lockedSteps.unlock') },
  ], [t]);

  return (
    <div className="app-container">
      <StepIndicator steps={steps} currentStep={0} />
      
      <div className="step-content">
        <UnlockEditor
          onUnlocked={onUnlocked}
          onBack={onBack}
        />
      </div>
    </div>
  );
}

export default Locked;
