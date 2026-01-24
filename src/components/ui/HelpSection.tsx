import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './HelpSection.module.css';

interface HelpSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function HelpSection({ title, defaultOpen = false, children }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.helpSection} ${isOpen ? styles.open : ''}`}>
      <button 
        className={styles.helpSectionHeader} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <ChevronDown 
          size={20} 
          className={styles.helpSectionChevron}
          style={{ display: 'block', flexShrink: 0 }}
        />
        <span className={styles.helpSectionTitle}>{title}</span>
      </button>
      
      {isOpen && (
        <div className={styles.helpSectionContent}>
          {children}
        </div>
      )}
    </div>
  );
}

export default HelpSection;
