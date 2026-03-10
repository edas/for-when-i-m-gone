import styles from './Threshold.module.css';
import howStyles from './HowEditor.module.css';
import { Icon } from '@/components/ui/Icons';
import { useRecipientCount } from './useRecipientCount';
import { useIsThresholdReadOnly, useThresholdActions, useThresholdStoreWithDefault } from './useThreshold';
import { useTranslation } from 'react-i18next';

export function Threshold() {
  const { t } = useTranslation();
  const recipientCount = useRecipientCount();
  const threshold = useThresholdStoreWithDefault();
  const { increment, decrement, handleInputChange } = useThresholdActions();
  const isThresholdReadOnly = useIsThresholdReadOnly();

  return (
    <section className={howStyles.section}>
      <p className={howStyles.sectionSubtitle}>{t('howEditor.threshold.subtitle')}</p>
      <div className={styles.thresholdContent}>
        <div className={styles.inputSection}>
          <div className={styles.numberInputWrapper}>
            <button 
              className={styles.numberButton} 
              onClick={decrement}
              disabled={isThresholdReadOnly || threshold <= 2}
              aria-label="Decrease"
            >
              <Icon name="minus" size={24} />
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={styles.numberInput}
              value={threshold}
              onChange={handleInputChange}
              readOnly={isThresholdReadOnly}
            />
            <button 
              className={styles.numberButton} 
              onClick={increment}
              disabled={isThresholdReadOnly || threshold >= recipientCount}
              aria-label="Increase"
            >
              <Icon name="plus" size={24} />
            </button>
          </div>
          <span className={styles.recipientInfo}>
            {t('howEditor.threshold.outOf', { count: recipientCount })}
          </span>
        </div>
      </div>

      {(threshold === 1) && (
        <div className={styles.errorMessage}>
          <Icon name="alert-triangle" size={20} />
          <p>{t('howEditor.threshold.errorOne')}</p>
        </div>
      )}
    </section>
  );
}