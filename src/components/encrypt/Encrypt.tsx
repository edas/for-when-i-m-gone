import { useState, useMemo, useEffect, useCallback } from 'react';
import type { JSONContent } from '@tiptap/core';
import { getTranslations, type Language } from '../../lib/i18n';
import { getStoredData, type EncryptStoredData } from '../../lib/dataStore';
import { 
  type SecretCheckboxState, 
  type HowData, 
  type IntroCheckboxState,
  defaultSecretCheckboxState, 
  defaultIntroCheckboxState 
} from '../../lib/types/editorTypes';
import type { Recipient } from '../../lib/types/recipient';
import { SecretEditor } from './SecretEditor';
import { WhoEditor } from './WhoEditor';
import { HowEditor } from './HowEditor';
import { IntroMessageEditor } from './IntroMessageEditor';
import { GenerateEditor } from './GenerateEditor';
import { StepIndicator } from '../ui/StepIndicator';
import './Encrypt.css';

interface EncryptProps {
  lang: Language;
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
}

const defaultHowData: Partial<HowData> = {
  conditions: null,
  hasNoOpenConditions: false,
};

export function Encrypt({ lang, onBack }: EncryptProps) {
  // Load initial data from stored JSON
  const initialStoredData = useMemo(() => getStoredData() as EncryptStoredData, []);

  // Encrypt path state
  const [secretContent, setSecretContent] = useState(initialStoredData.what?.content ?? '');
  const [secretCheckboxState, setSecretCheckboxState] = useState<SecretCheckboxState>({
    ...defaultSecretCheckboxState,
    ...initialStoredData.what?.checkboxState,
  });
  const [secretSubmitted, setSecretSubmitted] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>(initialStoredData.who?.recipients ?? []);
  const [whoSubmitted, setWhoSubmitted] = useState(false);
  const [howData, setHowData] = useState<Partial<HowData>>({
    ...defaultHowData,
    ...initialStoredData.how,
  });
  const [howSubmitted, setHowSubmitted] = useState(false);
  const [introMessage, setIntroMessage] = useState<JSONContent | null>(initialStoredData.intro?.message ?? null);
  const [introCheckboxState, setIntroCheckboxState] = useState<IntroCheckboxState>({
    ...defaultIntroCheckboxState,
    ...initialStoredData.intro?.checkboxState,
  });
  const [introSubmitted, setIntroSubmitted] = useState(false);
  const [aesKey, setAesKey] = useState<Uint8Array | undefined>(initialStoredData.generate?.aesKey);
  const [shares] = useState<string[] | undefined>(initialStoredData.generate?.shares);
  const [generateSubmitted, setGenerateSubmitted] = useState(false);

  const t = useMemo(() => getTranslations(lang), [lang]);

  // Steps for encrypt mode
  const steps = useMemo(() => [
    { key: 'secret', label: t.steps.secret },
    { key: 'who', label: t.steps.who },
    { key: 'how', label: t.steps.how },
    { key: 'intro', label: t.steps.intro },
    { key: 'generate', label: t.steps.generate },
  ], [t]);

  // Current step based on submitted state
  const currentStep = useMemo(() => {
    if (!secretSubmitted) return 0;
    if (!whoSubmitted) return 1;
    if (!howSubmitted) return 2;
    if (!introSubmitted) return 3;
    if (!generateSubmitted) return 4;
    return 4; // Stay on last step when completed
  }, [secretSubmitted, whoSubmitted, howSubmitted, introSubmitted, generateSubmitted]);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }, []);

  // Secret handlers
  const handleSecretContinue = useCallback((secret: string, checkboxState: SecretCheckboxState) => {
    setSecretContent(secret);
    setSecretCheckboxState(checkboxState);
    setSecretSubmitted(true);
    scrollToTop();
  }, [scrollToTop]);

  const handleSecretBack = useCallback((secret: string, checkboxState: SecretCheckboxState) => {
    setSecretContent(secret);
    setSecretCheckboxState(checkboxState);
    onBack();
    scrollToTop();
  }, [onBack, scrollToTop]);

  // Who handlers
  const handleWhoContinue = useCallback((newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
    setWhoSubmitted(true);
    scrollToTop();
  }, [scrollToTop]);

  const handleWhoBack = useCallback((newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
    setSecretSubmitted(false);
    scrollToTop();
  }, [scrollToTop]);

  // How handlers
  const handleHowContinue = useCallback((data: HowData) => {
    setHowData(data);
    setHowSubmitted(true);
    scrollToTop();
  }, [scrollToTop]);

  const handleHowBack = useCallback((data: HowData) => {
    setHowData(data);
    setWhoSubmitted(false);
    scrollToTop();
  }, [scrollToTop]);

  // Intro handlers
  const handleIntroContinue = useCallback((message: JSONContent | null, checkboxState: IntroCheckboxState) => {
    setIntroMessage(message);
    setIntroCheckboxState(checkboxState);
    setIntroSubmitted(true);
    scrollToTop();
  }, [scrollToTop]);

  const handleIntroBack = useCallback((message: JSONContent | null, checkboxState: IntroCheckboxState) => {
    setIntroMessage(message);
    setIntroCheckboxState(checkboxState);
    setHowSubmitted(false);
    scrollToTop();
  }, [scrollToTop]);

  // Generate handlers
  const handleGenerateContinue = useCallback(() => {
    setGenerateSubmitted(true);
    scrollToTop();
  }, [scrollToTop]);

  const handleGenerateBack = useCallback(() => {
    const storedData = getStoredData() as EncryptStoredData;
    // Synchronize recipients with store to get updated numbers
    if (storedData.who?.recipients) {
      setRecipients(storedData.who.recipients);
    }
    setGenerateSubmitted(false);
    setIntroSubmitted(false);
    scrollToTop();
  }, [scrollToTop]);

  // Synchronize aesKey with store when on HowEditor screen
  useEffect(() => {
    if (!howSubmitted && secretSubmitted && whoSubmitted) {
      const storedData = getStoredData() as EncryptStoredData;
      if (storedData.generate?.aesKey instanceof Uint8Array) {
        setAesKey(storedData.generate.aesKey);
      }
    }
  }, [howSubmitted, secretSubmitted, whoSubmitted]);

  return (
    <div className="app-container">
      <StepIndicator steps={steps} currentStep={currentStep} />
      
      <div className="step-content">
        {!secretSubmitted ? (
          <SecretEditor
            lang={lang}
            initialValue={secretContent}
            initialCheckboxState={secretCheckboxState}
            onContinue={handleSecretContinue}
            onBack={handleSecretBack}
          />
        ) : !whoSubmitted ? (
          <WhoEditor
            lang={lang}
            initialRecipients={recipients}
            onContinue={handleWhoContinue}
            onBack={handleWhoBack}
          />
        ) : !howSubmitted ? (
          <HowEditor
            lang={lang}
            recipientCount={recipients.length}
            initialData={howData}
            aesKey={aesKey}
            onContinue={handleHowContinue}
            onBack={handleHowBack}
          />
        ) : !introSubmitted ? (
          <IntroMessageEditor
            lang={lang}
            initialValue={introMessage}
            initialCheckboxState={introCheckboxState}
            threshold={howData.threshold!}
            conditions={howData.conditions ?? null}
            recipients={recipients}
            onContinue={handleIntroContinue}
            onBack={handleIntroBack}
          />
        ) : !generateSubmitted ? (
          <GenerateEditor
            lang={lang}
            secret={secretContent}
            recipients={recipients}
            threshold={howData.threshold!}
            aesKey={aesKey}
            shares={shares}
            onContinue={handleGenerateContinue}
            onBack={handleGenerateBack}
          />
        ) : (
          <main>
            <h1>For When I'm Gone</h1>
            <p>Secret has been saved. Next steps will appear here.</p>
          </main>
        )}
      </div>
    </div>
  );
}

export default Encrypt;
