import { ChangeEvent } from 'react';
import styles from './CheckboxItem.module.css';

interface CheckboxItemProps {
  checked: boolean;
  label: string;
  description?: string;
  essential?: boolean;
  readonly?: boolean;
  strikethrough?: boolean;
  onChange?: (checked: boolean) => void;
}

export function CheckboxItem({ 
  checked, 
  label, 
  description, 
  essential = false, 
  readonly = false, 
  strikethrough = false, 
  onChange 
}: CheckboxItemProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (readonly) {
      event.preventDefault();
      return;
    }
    onChange?.(event.target.checked);
  }

  const classNames = [
    styles.checkboxItem,
    essential && styles.essential,
    readonly && styles.readonly,
    strikethrough && styles.strikethrough,
  ].filter(Boolean).join(' ');

  return (
    <label className={classNames}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={handleChange} 
        disabled={readonly} 
      />
      <span className={styles.customCheckbox}></span>
      {description ? (
        <div className={styles.labelContent}>
          <span className={styles.labelTitle}>{label}</span>
          <span className={styles.labelDescription}>{description}</span>
        </div>
      ) : (
        <span className={styles.labelText}>{label}</span>
      )}
    </label>
  );
}

export default CheckboxItem;
