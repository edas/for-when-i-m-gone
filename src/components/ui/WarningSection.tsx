import { Icon } from './Icons';
import styles from './WarningSection.module.css';

interface WarningSectionProps {
  text: string;
}

export function WarningSection({ text }: WarningSectionProps) {
  return (
    <div className={styles.warningSection}>
      <div className={styles.warningIcon}>
        <Icon name="alert-triangle" size={20} />
      </div>
      <p className={styles.warningText}>{text}</p>
    </div>
  );
}

export default WarningSection;
