import { ChangeEvent } from 'react';
import './CheckboxItem.css';

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
    'checkbox-item',
    essential && 'essential',
    readonly && 'readonly',
    strikethrough && 'strikethrough',
  ].filter(Boolean).join(' ');

  return (
    <label className={classNames}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={handleChange} 
        disabled={readonly} 
      />
      <span className="custom-checkbox"></span>
      {description ? (
        <div className="label-content">
          <span className="label-title">{label}</span>
          <span className="label-description">{description}</span>
        </div>
      ) : (
        <span className="label-text">{label}</span>
      )}
    </label>
  );
}

export default CheckboxItem;
