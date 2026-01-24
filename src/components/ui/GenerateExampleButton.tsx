import { Icon } from './Icons';
import styles from './GenerateExampleButton.module.css';

interface GenerateExampleButtonProps {
  label: string;
  onClick: () => void;
}

export function GenerateExampleButton({ label, onClick }: GenerateExampleButtonProps) {
  return (
    <button className={styles.generateExampleButton} onClick={onClick}>
      <Icon name="plus" size={18} />
      {label}
    </button>
  );
}

export default GenerateExampleButton;
