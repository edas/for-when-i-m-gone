import { Icon } from './Icons';
import styles from './TipSection.module.css';

interface TipSectionProps {
  text: string;
}

export function TipSection({ text }: TipSectionProps) {
  return (
    <div className={styles.tipSection}>
      <div className={styles.tipIcon}>
        <Icon name="info" size={20} />
      </div>
      <p className={styles.tipText}>{text}</p>
    </div>
  );
}

export default TipSection;
