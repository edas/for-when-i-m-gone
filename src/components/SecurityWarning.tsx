import { useState, useMemo, useCallback, ChangeEvent } from 'react';
import { getTranslations, type Language } from '../lib/i18n';
import { recordSecurityConfirmation } from '../lib/security';
import { LanguageSelector } from './ui/LanguageSelector';
import { Icon } from './ui/Icons';
import './SecurityWarning.css';

interface SecurityWarningProps {
  lang: Language;
  initialChecked?: boolean;
  onContinue: (checked: boolean) => void;
  onLanguageChange: (lang: Language) => void;
}

export function SecurityWarning({ lang, initialChecked, onContinue, onLanguageChange }: SecurityWarningProps) {
  const [isChecked, setIsChecked] = useState(initialChecked ?? false);

  const t = useMemo(() => getTranslations(lang), [lang]);

  const handleCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    
    // Record timestamp each time the checkbox is checked
    if (checked) {
      recordSecurityConfirmation();
    }
  }, []);

  const handleContinue = useCallback(() => {
    if (isChecked) {
      onContinue(isChecked);
    }
  }, [isChecked, onContinue]);

  return (
    <div className="overlay">
      <LanguageSelector lang={lang} onLanguageChange={onLanguageChange} />

      <div className="warning-container">
        <div className="warning-icon">
          <Icon name="warning" size={80} />
        </div>

        <h1>{t.securityWarning.title}</h1>
        <p className="subtitle">{t.securityWarning.subtitle}</p>

        <div className="checkbox-container">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <span className="checkmark"></span>
            <span className="label-text">
              {t.securityWarning.checkboxLabel}
              <a
                href="https://github.com/edas/for-when-i-m-gone"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.securityWarning.checkboxLabelLink}
              </a>
              {t.securityWarning.checkboxLabelEnd}
            </span>
          </label>
        </div>

        <button
          className="continue-button"
          disabled={!isChecked}
          onClick={handleContinue}
        >
          {t.securityWarning.continueButton}
        </button>
      </div>
    </div>
  );
}

export default SecurityWarning;
