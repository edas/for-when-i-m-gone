import { useState, useCallback, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './ui/LanguageSelector';
import { Icon } from './ui/Icons';
import { ActionButton } from './ui/ActionButton';
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

        <ActionButton
          disabled={!isChecked}
          onClick={handleContinue}
        >
          {t('securityWarning.continueButton')}
        </ActionButton>
      </div>
    </div>
  );
}

export default SecurityWarning;
