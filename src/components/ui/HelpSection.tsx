import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './HelpSection.css';

interface HelpSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function HelpSection({ title, defaultOpen = false, children }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`help-section ${isOpen ? 'open' : ''}`}>
      <button 
        className="help-section-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <ChevronDown 
          size={20} 
          className="help-section-chevron"
          style={{ display: 'block', flexShrink: 0 }}
        />
        <span className="help-section-title">{title}</span>
      </button>
      
      {isOpen && (
        <div className="help-section-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default HelpSection;
