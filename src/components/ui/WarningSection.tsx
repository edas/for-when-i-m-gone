import { Icon } from './Icons';
import './WarningSection.css';

interface WarningSectionProps {
  text: string;
}

export function WarningSection({ text }: WarningSectionProps) {
  return (
    <div className="warning-section">
      <div className="warning-icon">
        <Icon name="alert-triangle" size={20} />
      </div>
      <p className="warning-text">{text}</p>
    </div>
  );
}

export default WarningSection;
