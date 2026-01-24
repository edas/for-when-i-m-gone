import { useState, useCallback, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { recordSecurityConfirmation } from '../lib/security';
import { LanguageSelector } from './ui/LanguageSelector';
import { Icon } from './ui/Icons';
import './SecurityWarning.css';

interface SecurityWarningProps {
  initialChecked?: boolean;
  onContinue: (checked: boolean) => void;
}

export function SecurityWarning({ initialChecked, onContinue }: SecurityWarningProps) {
  const [isChecked, setIsChecked] = useState(initialChecked ?? false);
  const { t } = useTranslation();

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
      <LanguageSelector />

      <div className="warning-container">
        <div className="warning-icon">
          <Icon name="warning" size={80} />
        </div>

        <h1>{t('securityWarning.title')}</h1>
        <p className="subtitle">{t('securityWarning.subtitle')}</p>

        <div className="checkbox-container">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <span className="checkmark"></span>
            <span className="label-text">
              {t('securityWarning.checkboxLabel')}
              <a
                href="https://github.com/edas/for-when-i-m-gone"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('securityWarning.checkboxLabelLink')}
              </a>
              {t('securityWarning.checkboxLabelEnd')}
            </span>
          </label>
        </div>

        <button
          className="continue-button"
          disabled={!isChecked}
          onClick={handleContinue}
        >
          {t('securityWarning.continueButton')}
        </button>
      </div>
    </div>
  );
}

export default SecurityWarning;
