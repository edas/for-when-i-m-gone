import { Icon } from './Icons';
import './GenerateExampleButton.css';

interface GenerateExampleButtonProps {
  label: string;
  onClick: () => void;
}

export function GenerateExampleButton({ label, onClick }: GenerateExampleButtonProps) {
  return (
    <button className="generate-example-button" onClick={onClick}>
      <Icon name="plus" size={18} />
      {label}
    </button>
  );
}

export default GenerateExampleButton;
