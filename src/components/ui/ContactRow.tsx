import type { ContactInfo } from '../../lib/types/recipient';
import { Icon } from './Icons';
import formControls from '../../styles/form-controls.module.css';

interface ContactTypeOption {
  value: string;
  label: string;
}

interface ContactRowProps {
  contact: ContactInfo;
  contactTypeOptions: ContactTypeOption[];
  placeholders: { value: string };
  removeTitle: string;
  onTypeChange: (type: string) => void;
  onValueChange: (value: string) => void;
  onRemove: () => void;
}

export function ContactRow({
  contact,
  contactTypeOptions,
  placeholders,
  removeTitle,
  onTypeChange,
  onValueChange,
  onRemove,
}: ContactRowProps) {
  return (
    <div className="contact-row">
      <select
        className={`${formControls.formSelect} contact-type`}
        value={contact.type}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        {contactTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        className={`${formControls.formInput} contact-value`}
        type="text"
        value={contact.value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholders.value}
      />
      <button
        className={formControls.removeButton}
        onClick={onRemove}
        title={removeTitle}
      >
        <Icon name="minus" size={14} />
      </button>
    </div>
  );
}

export default ContactRow;
