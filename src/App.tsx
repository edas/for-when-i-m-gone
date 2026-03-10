import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityWarning } from './components/security/SecurityWarning';
import { ModePlaceholder } from './components/ModePlaceholder';
import { Encrypt } from './components/encrypt/Encrypt';
import { useDataStore } from './lib/dataStore';
import styles from './App.module.css';



export function App() {
  return (<div className={styles.appContainer}>
    <AppContent />
  </div>)
}

function AppContent() {
  const [step, setStep] = useState(0);
  const onContinue = useCallback(() => setStep(step => step + 1), []);
  const onBack = useCallback(() => setStep(step => step - 1), []);


  const { i18n } = useTranslation();
  const language = useDataStore(state => state.language);
  useEffect(() => {
    if (language && (i18n.language !== language)) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n.language]);

  const appMode = useDataStore(state => state.mode);

  if (step === 0) {
    return <SecurityWarning onContinue={onContinue} />;
  }

  switch (appMode) {
    case 'locked':
    case 'decrypt':
      return <ModePlaceholder onBack={onBack} />;
    case 'encrypt':
      return <Encrypt onBack={onBack} />;
    default:
      throw new Error(`Unknown app mode: ${appMode}`);
  }
}
