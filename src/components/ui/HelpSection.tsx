import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './HelpSection.module.css';

type HelpSectionVariant = 'error' | 'warning' | 'info' | 'success';

interface HelpSectionProps {
  title: string;
  defaultOpen?: boolean;
  variant?: HelpSectionVariant;
  children: ReactNode;
}

export function HelpSection({ title, defaultOpen = false, variant = 'info', children }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerVariantClass = styles[`helpSectionHeader${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || '';
  const sectionVariantClass = variant !== 'info' ? styles[`helpSection${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || '' : '';

  return (
    <div className={`${styles.helpSection} ${isOpen ? styles.open : ''} ${sectionVariantClass}`}>
      <button 
        className={`${styles.helpSectionHeader} ${headerVariantClass}`}
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
