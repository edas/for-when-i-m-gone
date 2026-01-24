import { Icon } from './Icons';
import './TipSection.css';

interface TipSectionProps {
  text: string;
}

export function TipSection({ text }: TipSectionProps) {
  return (
    <div className="tip-section">
      <div className="tip-icon">
        <Icon name="info" size={20} />
      </div>
      <p className="tip-text">{text}</p>
    </div>
  );
}

export default TipSection;
