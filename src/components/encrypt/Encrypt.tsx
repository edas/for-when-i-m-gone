import { useCallback, useState } from 'react';
import { SecretEditor } from './SecretEditor';
import { WhoEditor } from './WhoEditor';
import { HowEditor } from './HowEditor';
import { IntroMessageEditor } from './IntroMessageEditor';
import { GenerateEditor } from './GenerateEditor';
import { EncryptStepHeader } from './header/EncryptStepHeader';

interface EncryptProps {
  onBack: () => void;
}

export function Encrypt({ onBack: backToParent }: EncryptProps) {
  const [step, setStep] = useState(0);
  const onContinue = useCallback(() => setStep(step => step + 1), []);
  const onBack = useCallback(() => {
    if (step === 0) {
      backToParent();
    } else {
      setStep(step => step - 1);
    }
  }, [step, backToParent]);

  return (
    <>
      <EncryptStepHeader currentStep={step} />
      {step === 0 && <SecretEditor onContinue={onContinue} onBack={onBack} />}
      {step === 1 && <WhoEditor onContinue={onContinue} onBack={onBack} />}
      {step === 2 && <HowEditor onContinue={onContinue} onBack={onBack} />}
      {step === 3 && <IntroMessageEditor onContinue={onContinue} onBack={onBack} />}
      {step === 4 && <GenerateEditor onBack={onBack} />}
      {step > 4 && (() => { throw new Error(`Unknown step: ${step}`); })()}
    </>
  );
}
