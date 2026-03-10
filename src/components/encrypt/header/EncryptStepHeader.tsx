import { useTranslation } from 'react-i18next';
import { StepIndicator } from '../../ui/StepIndicator';
import styles from './EncryptStepHeader.module.css';

interface EncryptStepHeaderProps {
  currentStep: number;
}

export function EncryptStepHeader({ currentStep }: EncryptStepHeaderProps) {
  const { t } = useTranslation();

  const steps = [
    { key: 'secret', label: t('steps.secret') },
    { key: 'who', label: t('steps.who') },
    { key: 'how', label: t('steps.how') },
    { key: 'intro', label: t('steps.intro') },
    { key: 'generate', label: t('steps.generate') },
  ];

  return (
    <div className={styles.headerWrapper}>
      <StepIndicator steps={steps} currentStep={currentStep} />
    </div>
  );
}
