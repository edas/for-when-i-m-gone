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

  function handleRemoveClick(e: MouseEvent): void {
    e.stopPropagation();
    onRemove();
  }

  function handlePrivateToggle(e: MouseEvent): void {
    e.stopPropagation();
    onUpdateField('isPrivate', !(recipient.isPrivate ?? false));
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
        <div
          className={styles.dragHandle}
          role="presentation"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Icon name="grip-vertical" size={18} />
        </div>
        <div className={styles.recipientSummary}>
          {expanded ? (
            <div className={styles.nameInputWrapper}>
              <input
                ref={nameInputRef}
                id={`name-${recipient.id}`}
                type="text"
                className={`${formControls.formInput} ${styles.recipientNameInput}`}
                value={recipient.name}
                onChange={(e) => onUpdateField('name', e.target.value)}
                placeholder={t.placeholders.name}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
              {recipient.isPrivate ? (
                <div className={styles.privateInfoMessage}>
                  {t.fields.privateInfo}
                </div>
              ) : recipient.number ? (
                <div className={styles.privateInfoMessage}>
                  {t.fields.numberedInfo}
                </div>
              ) : null}
            </div>
          ) : (
            <span className={`${styles.recipientName} ${recipient.isPrivate ? styles.private : ''}`}>
              {recipient.name || t.newRecipient}
              {recipient.number !== undefined && (
                <span className={styles.recipientNumber}> (#{recipient.number})</span>
              )}
            </span>
          )}
        </div>
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
      </div>

      {expanded && (
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
      )}
    </div>
  );
}

export default RecipientCard;
