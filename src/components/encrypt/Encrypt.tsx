import { useCallback, useState } from 'react';
import SecretEditor from './SecretEditor';
import WhoEditor from './WhoEditor';
import HowEditor from './HowEditor';
import IntroMessageEditor from './IntroMessageEditor';
import GenerateEditor from './GenerateEditor';

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
  }, [step]);

  if (step === 0) return (<SecretEditor onContinue={onContinue} onBack={onBack} />);
  if (step === 1) return (<WhoEditor onContinue={onContinue} onBack={onBack} />);
  if (step === 2) return (<HowEditor onContinue={onContinue} onBack={onBack} />);
  if (step === 3) return (<IntroMessageEditor onContinue={onContinue} onBack={onBack} />);
  if (step === 4) return (<GenerateEditor onBack={onBack} />);
  throw new Error(`Unknown step: ${step}`);
}

export default Encrypt;
