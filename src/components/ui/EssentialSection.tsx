import { ReactNode } from 'react';
import { Icon } from './Icons';
import './EssentialSection.css';

interface EssentialSectionProps {
  note?: string;
  children: ReactNode;
}

export function EssentialSection({ note, children }: EssentialSectionProps) {
  return (
    <div className="essential-section">
      <div className="essential-badge">
        <Icon name="star" size={16} />
      </div>
      {children}
      {note && <p className="essential-note">{note}</p>}
    </div>
  );
}

export default EssentialSection;
