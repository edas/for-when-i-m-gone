import { useState, useCallback, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { recordSecurityConfirmation } from '../lib/security';
import { LanguageSelector } from './ui/LanguageSelector';
import { Icon } from './ui/Icons';
import styles from './SecurityWarning.module.css';

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
    <div className={styles.overlay}>
      <LanguageSelector />

      <div className={styles.warningContainer}>
        <div className={styles.warningIcon}>
          <Icon name="warning" size={80} />
        </div>

        <h1>{t('securityWarning.title')}</h1>
        <p className={styles.subtitle}>{t('securityWarning.subtitle')}</p>

        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <span className={styles.checkmark}></span>
            <span className={styles.labelText}>
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
          className={styles.continueButton}
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
