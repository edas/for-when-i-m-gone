import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityWarning } from './components/SecurityWarning';
import { Locked } from './components/locked/Locked';
import { Encrypt } from './components/encrypt/Encrypt';
import { useDataStore } from './lib/dataStore';
import { Decrypt } from './components/decrypt/Decrypt';
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
    return (
        <SecurityWarning onContinue={onContinue} />
    );
  }
  
  else if (step === 1) {
    if (appMode === 'locked') {
      return (
          <Locked onBack={onBack} />
      );
    }
    else if (appMode === 'encrypt') {
      return (
          <Encrypt onBack={onBack} />
      );
    }
    else if (appMode === 'decrypt') {
      return (
          <Decrypt onBack={onBack} />
      );
    }
    throw new Error(`Unknown app mode: ${appMode}`);
  }
  
  throw new Error(`Unknown step: ${step}`);
}

export default App;
