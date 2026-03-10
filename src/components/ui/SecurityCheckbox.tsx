import { ChangeEvent, ReactNode } from 'react';
import styles from './SecurityCheckbox.module.css';

interface SecurityCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

export function SecurityCheckbox({ checked, onChange, children }: SecurityCheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className={styles.checkboxContainer}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
        />
        <span className={styles.checkmark}></span>
        <span className={styles.labelText}>
          {children}
        </span>
      </label>
    </div>
  );
}
