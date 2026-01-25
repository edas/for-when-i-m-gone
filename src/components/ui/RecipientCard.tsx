import { useEffect, useRef, KeyboardEvent, MouseEvent, DragEvent } from 'react';
import type { Recipient } from '../../lib/types/recipient';
import { ContactRow } from './ContactRow';
import { Icon } from './Icons';
import formControls from '../../styles/form-controls.module.css';
import styles from './RecipientCard.module.css';

interface ContactTypeOption {
  value: string;
  label: string;
}

interface Translations {
  newRecipient: string;
  removeRecipient: string;
  addContact: string;
  removeContact: string;
  fields: {
    name: string;
    contacts: string;
    notListedPublicly: string;
    privateInfo: string;
    numberedInfo: string;
  };
  placeholders: {
    name: string;
    contactValue: string;
  };
}

interface RecipientCardProps {
  recipient: Recipient;
  expanded: boolean;
  dragging: boolean;
  contactTypeOptions: ContactTypeOption[];
  translations: Translations;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateField: (field: 'name' | 'isPrivate', value: string | boolean) => void;
  onAddContact: () => void;
  onRemoveContact: (contactId: string) => void;
  onUpdateContact: (contactId: string, field: 'type' | 'value', value: string) => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  autoFocus?: boolean;
  toggleDisabled?: boolean;
}

function DragHandle() {
  return (
    <div
      className={styles.dragHandle}
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Icon name="grip-vertical" size={18} />
    </div>
  );
}

interface RecipientNameInputProps {
  recipient: Recipient;
  nameInputRef: React.RefObject<HTMLInputElement>;
  placeholder: string;
  privateInfo: string;
  numberedInfo: string;
  onUpdateField: (field: 'name' | 'isPrivate', value: string | boolean) => void;
}

function RecipientNameInput({
  recipient,
  nameInputRef,
  placeholder,
  privateInfo,
  numberedInfo,
  onUpdateField,
}: RecipientNameInputProps) {
  return (
    <div className={styles.nameInputWrapper}>
      <input
        ref={nameInputRef}
        id={`name-${recipient.id}`}
        type="text"
        className={`${formControls.formInput} ${styles.recipientNameInput}`}
        value={recipient.name}
        onChange={(e) => onUpdateField('name', e.target.value)}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      />
      {recipient.isPrivate ? (
        <div className={styles.privateInfoMessage}>
          {privateInfo}
        </div>
      ) : recipient.number ? (
        <div className={styles.privateInfoMessage}>
          {numberedInfo}
        </div>
      ) : null}
    </div>
  );
}

interface RecipientNameDisplayProps {
  recipient: Recipient;
  newRecipient: string;
}

function RecipientNameDisplay({ recipient, newRecipient }: RecipientNameDisplayProps) {
  return (
    <span className={`${styles.recipientName} ${recipient.isPrivate ? styles.private : ''}`}>
      {recipient.name || newRecipient}
      {recipient.number !== undefined && (
        <span className={styles.recipientNumber}> (#{recipient.number})</span>
      )}
    </span>
  );
}

interface RecipientSummaryProps {
  recipient: Recipient;
  expanded: boolean;
  nameInputRef: React.RefObject<HTMLInputElement>;
  translations: Translations;
  onUpdateField: (field: 'name' | 'isPrivate', value: string | boolean) => void;
}

function RecipientSummary({
  recipient,
  expanded,
  nameInputRef,
  translations: t,
  onUpdateField,
}: RecipientSummaryProps) {
  return (
    <div className={styles.recipientSummary}>
      {expanded ? (
        <RecipientNameInput
          recipient={recipient}
          nameInputRef={nameInputRef}
          placeholder={t.placeholders.name}
          privateInfo={t.fields.privateInfo}
          numberedInfo={t.fields.numberedInfo}
          onUpdateField={onUpdateField}
        />
      ) : (
        <RecipientNameDisplay
          recipient={recipient}
          newRecipient={t.newRecipient}
        />
      )}
    </div>
  );
}

interface RecipientActionsProps {
  recipient: Recipient;
  expanded: boolean;
  translations: Translations;
  onRemove: () => void;
  onUpdateField: (field: 'name' | 'isPrivate', value: string | boolean) => void;
}

function RecipientActions({
  recipient,
  expanded,
  translations: t,
  onRemove,
  onUpdateField,
}: RecipientActionsProps) {
  function handleRemoveClick(e: MouseEvent): void {
    e.stopPropagation();
    onRemove();
  }

  function handlePrivateToggle(e: MouseEvent): void {
    e.stopPropagation();
    onUpdateField('isPrivate', !(recipient.isPrivate ?? false));
  }

  return (
    <div className={styles.recipientActions}>
      {expanded && (
        <button
          className={styles.privateToggleButton}
          onClick={handlePrivateToggle}
          title={t.fields.notListedPublicly}
        >
          <Icon name={recipient.isPrivate ? 'eye-off' : 'eye'} size={18} />
        </button>
      )}
      {expanded && !recipient.number && (
        <button
          className={`${styles.removeButton} ${styles.large}`}
          onClick={handleRemoveClick}
          title={t.removeRecipient}
        >
          <Icon name="minus" size={16} />
        </button>
      )}
      <span className={`${styles.expandIcon} ${expanded ? styles.rotated : ''}`}>
        <Icon name="chevron-right" size={20} />
      </span>
    </div>
  );
}

interface RecipientDetailsProps {
  recipient: Recipient;
  contactTypeOptions: ContactTypeOption[];
  translations: Translations;
  onAddContact: () => void;
  onRemoveContact: (contactId: string) => void;
  onUpdateContact: (contactId: string, field: 'type' | 'value', value: string) => void;
}

function RecipientDetails({
  recipient,
  contactTypeOptions,
  translations: t,
  onAddContact,
  onRemoveContact,
  onUpdateContact,
}: RecipientDetailsProps) {
  return (
    <div className={styles.recipientDetails}>
      <div className={styles.contactsSection}>
        {recipient.contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            contactTypeOptions={contactTypeOptions}
            placeholders={{ value: t.placeholders.contactValue }}
            removeTitle={t.removeContact}
            onTypeChange={(type) => onUpdateContact(contact.id, 'type', type)}
            onValueChange={(value) => onUpdateContact(contact.id, 'value', value)}
            onRemove={() => onRemoveContact(contact.id)}
          />
        ))}

        <button className={styles.addButton} onClick={onAddContact}>
          <Icon name="plus" size={16} />
          {t.addContact}
        </button>
      </div>
    </div>
  );
}

export function RecipientCard({
  recipient,
  expanded,
  dragging,
  contactTypeOptions,
  translations: t,
  onToggle,
  onRemove,
  onUpdateField,
  onAddContact,
  onRemoveContact,
  onUpdateContact,
  onDragStart,
  onDragEnd,
  autoFocus = false,
  toggleDisabled = false,
}: RecipientCardProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && expanded && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus, expanded]);

  function handleKeydown(e: KeyboardEvent): void {
    if (toggleDisabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }
  
  function handleToggle(): void {
    if (!toggleDisabled) {
      onToggle();
    }
  }

  const cardClassNames = [
    styles.recipientCard,
    expanded && styles.expanded,
    dragging && styles.dragging,
  ].filter(Boolean).join(' ');

  const headerClassNames = [
    styles.recipientHeader,
    toggleDisabled && styles.toggleDisabled,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClassNames}
      role="listitem"
      draggable="true"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className={headerClassNames}
        role="button"
        tabIndex={toggleDisabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeydown}
      >
        <DragHandle />
        <RecipientSummary
          recipient={recipient}
          expanded={expanded}
          nameInputRef={nameInputRef}
          translations={t}
          onUpdateField={onUpdateField}
        />
        <RecipientActions
          recipient={recipient}
          expanded={expanded}
          translations={t}
          onRemove={onRemove}
          onUpdateField={onUpdateField}
        />
      </div>

      {expanded && (
        <RecipientDetails
          recipient={recipient}
          contactTypeOptions={contactTypeOptions}
          translations={t}
          onAddContact={onAddContact}
          onRemoveContact={onRemoveContact}
          onUpdateContact={onUpdateContact}
        />
      )}
    </div>
  );
}

export default RecipientCard;
