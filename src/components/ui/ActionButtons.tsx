import { Icon } from './Icons';
import { type ButtonState } from '../../lib/buttonState';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  backLabel: string;
  continueLabel: string;
  buttonState?: ButtonState;
  disabled?: boolean;
  onBack: () => void;
  onContinue: () => void;
  alternativeLabel?: string;
  showAlternative?: boolean;
  onAlternative?: () => void;
  showContinue?: boolean;
}

export function ActionButtons({ 
  backLabel, 
  continueLabel, 
  buttonState = 'complete', 
  disabled = false, 
  onBack, 
  onContinue,
  alternativeLabel,
  showAlternative = false,
  onAlternative,
  showContinue = true,
}: ActionButtonsProps) {
  const stateClassMap: Record<ButtonState, string> = {
    none: styles.stateNone,
    partial: styles.statePartial,
    complete: styles.stateComplete,
  };
  const stateClass = stateClassMap[buttonState];

  return (
    <div className={styles.buttonContainer}>
      <button className={styles.backButton} onClick={onBack}>
        <Icon name="arrow-left" size={18} />
        {backLabel}
      </button>
      {showContinue && (
        <>
          {showAlternative && alternativeLabel && onAlternative ? (
            <button className={styles.alternativeButton} onClick={onAlternative}>
              <Icon name="plus" size={18} />
              {alternativeLabel}
            </button>
          ) : (
            <button
              className={`${styles.continueButton} ${stateClass}`}
              disabled={disabled}
              onClick={onContinue}
            >
              {buttonState === 'none' ? (
                <Icon name="info" />
              ) : buttonState === 'partial' ? (
                <Icon name="layers" />
              ) : (
                <Icon name="check" />
              )}
              {continueLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default ActionButtons;
