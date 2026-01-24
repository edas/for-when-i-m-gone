import { useState, useCallback, useMemo } from 'react';
import { SecurityWarning } from './components/SecurityWarning';
import { Locked } from './components/locked/Locked';
import { Encrypt } from './components/encrypt/Encrypt';
import { detectLanguage, type Language } from './lib/i18n';
import { getStoredData, updateStoredData, getAppMode, type AppMode } from './lib/dataStore';
import './App.css';

export function App() {
  // Load initial data from stored JSON
  const initialStoredData = useMemo(() => getStoredData(), []);

  // Determine app mode from initial DOM data (can change after unlock)
  const [appMode, setAppMode] = useState<AppMode>(() => getAppMode());
  const [currentLang, setCurrentLang] = useState<Language>(() => 
    (initialStoredData.language as Language) ?? detectLanguage()
  );
  const [securityConfirmed, setSecurityConfirmed] = useState(false);
  const [securityChecked, setSecurityChecked] = useState(() => 
    !!initialStoredData.security?.confirmedAt
  );

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }, []);

  const handleSecurityContinue = useCallback((checked: boolean) => {
    setSecurityChecked(checked);
    setSecurityConfirmed(true);
    scrollToTop();
  }, [scrollToTop]);

  const handleSecurityBack = useCallback(() => {
    setSecurityConfirmed(false);
    scrollToTop();
  }, [scrollToTop]);

  const handleUnlocked = useCallback((newMode: AppMode) => {
    // After successful unlock, update app mode to the decrypted mode
    setAppMode(newMode);
    
    // Reload language from decrypted data
    const newStoredData = getStoredData();
    setCurrentLang((newStoredData.language as Language) ?? currentLang);
    setSecurityChecked(!!newStoredData.security?.confirmedAt);
    
    scrollToTop();
  }, [currentLang, scrollToTop]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setCurrentLang(lang);
    updateStoredData((currentData) => ({ ...currentData, language: lang }));
  }, []);

  if (!securityConfirmed) {
    return (
      <SecurityWarning
        lang={currentLang}
        initialChecked={securityChecked}
        onContinue={handleSecurityContinue}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  if (appMode === 'locked') {
    return (
      <Locked
        lang={currentLang}
        onUnlocked={handleUnlocked}
        onBack={handleSecurityBack}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  if (appMode === 'encrypt') {
    return (
      <Encrypt
        lang={currentLang}
        onBack={handleSecurityBack}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // Decrypt mode - to be implemented later
  return (
    <div className="app-container">
      <main>
        <h1>Decrypt Mode</h1>
        <p>This mode will be implemented later.</p>
        <button onClick={handleSecurityBack}>Back</button>
      </main>
    </div>
  );
}

export default App;
