import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityWarning } from './components/SecurityWarning';
import { Locked } from './components/locked/Locked';
import { Encrypt } from './components/encrypt/Encrypt';
import { detectLanguage, type Language } from './lib/i18n';
import { useData } from './lib/DataContext';
import { type AppMode } from './lib/dataStore';
import styles from './App.module.css';

export function App() {
  const { storedData } = useData();
  const { i18n } = useTranslation();

  // Determine app mode from stored data (reactive)
  const appMode = storedData.mode as AppMode;
  const [securityConfirmed, setSecurityConfirmed] = useState(false);
  const [securityChecked, setSecurityChecked] = useState(() => 
    !!storedData.security?.confirmedAt
  );

  // Sync i18next language with storedData
  useEffect(() => {
    const storedLang = (storedData.language as Language) ?? detectLanguage();
    if (i18n.language !== storedLang) {
      i18n.changeLanguage(storedLang);
    }
  }, [storedData.language, i18n.language, i18n]);

  const handleSecurityContinue = useCallback((checked: boolean) => {
    setSecurityChecked(checked);
    setSecurityConfirmed(true);
  }, []);

  const handleSecurityBack = useCallback(() => {
    setSecurityConfirmed(false);
  }, []);

  const handleUnlocked = useCallback(() => {
    // After successful unlock, the storedData will be updated reactively
    // Just sync the local UI state with the new data
    setSecurityChecked(!!storedData.security?.confirmedAt);
  }, [storedData]);

  if (!securityConfirmed) {
    return (
      <SecurityWarning
        initialChecked={securityChecked}
        onContinue={handleSecurityContinue}
      />
    );
  }

  if (appMode === 'locked') {
    return (
      <Locked
        onUnlocked={handleUnlocked}
        onBack={handleSecurityBack}
      />
    );
  }

  if (appMode === 'encrypt') {
    return (
      <Encrypt
        onBack={handleSecurityBack}
      />
    );
  }

  // Decrypt mode - to be implemented later
  return (
    <div className={styles.appContainer}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Decrypt Mode</h1>
        <p className={styles.p}>This mode will be implemented later.</p>
        <button className={styles.button} onClick={handleSecurityBack}>Back</button>
      </main>
    </div>
  );
}

export default App;
