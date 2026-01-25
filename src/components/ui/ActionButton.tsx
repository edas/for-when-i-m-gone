import { ReactNode } from 'react';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function ActionButton({
  children,
  onClick,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      className={styles.button}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default ActionButton;
