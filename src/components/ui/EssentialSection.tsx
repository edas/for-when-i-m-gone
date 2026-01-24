import { ReactNode } from 'react';
import { Icon } from './Icons';
import styles from './EssentialSection.module.css';

interface EssentialSectionProps {
  note?: string;
  children: ReactNode;
}

export function EssentialSection({ note, children }: EssentialSectionProps) {
  return (
    <div className={styles.essentialSection}>
      <div className={styles.essentialBadge}>
        <Icon name="star" size={16} />
      </div>
      {children}
      {note && <p className={styles.essentialNote}>{note}</p>}
    </div>
  );
}

export default EssentialSection;
