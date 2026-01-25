import { useEffect, useRef, type DragEvent } from 'react';
import type { Recipient } from '../../../lib/types/recipient';
import { ContactRow } from './ContactRow';
import { Icon } from '../../ui/Icons';
import formControls from '../../../styles/form-controls.module.css';
import styles from './RecipientCard.module.css';
import { useRecipientActions } from './useRecipients';

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
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  autoFocus?: boolean;
  toggleDisabled?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
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
}

function RecipientNameInput({
  recipient,
  nameInputRef,
  placeholder,
  privateInfo,
  numberedInfo,
}: RecipientNameInputProps) {
  const { updateRecipientName } = useRecipientActions();
  return (
    <div className={styles.nameInputWrapper}>
      <input
        ref={nameInputRef}
        id={`name-${recipient.id}`}
        type="text"
        className={`${formControls.formInput} ${styles.recipientNameInput}`}
        value={recipient.name}
        onChange={(e) => updateRecipientName(recipient.id, e.target.value)}
        placeholder={placeholder}
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
}

function RecipientSummary({
  recipient,
  expanded,
  nameInputRef,
  translations: t,
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
}

function RecipientActions({
  recipient,
  expanded,
  translations: t,
}: RecipientActionsProps) {
  
  const { removeRecipient, updateRecipientVisibility } = useRecipientActions();

  return (
    <div className={styles.recipientActions}>
      {expanded && (
        <button
          className={styles.privateToggleButton}
          onClick={() => updateRecipientVisibility(recipient.id, !recipient.isPrivate)}
          title={t.fields.notListedPublicly}
        >
          <Icon name={recipient.isPrivate ? 'eye-off' : 'eye'} size={18} />
        </button>
      )}
      {expanded && !recipient.number && (
        <button
          className={`${styles.removeButton} ${styles.large}`}
          onClick={() => { removeRecipient(recipient.id) }}
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
}

function RecipientDetails({
  recipient,
  contactTypeOptions,
  translations: t,
}: RecipientDetailsProps) {
  const { addRecipientContact, removeRecipientContact, updateRecipientContact } = useRecipientActions();
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
            onTypeChange={(type) => updateRecipientContact(recipient.id, contact.id, 'type', type)}
            onValueChange={(value) => updateRecipientContact(recipient.id, contact.id, 'value', value)}
            onRemove={() => removeRecipientContact(recipient.id, contact.id)}
          />
        ))}

        <button className={styles.addButton} onClick={() => addRecipientContact(recipient.id)}>
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
  onDragStart,
  onDragEnd,
  autoFocus = false,
  toggleDisabled = false,
  onExpand,
  onCollapse,
}: RecipientCardProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && expanded && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus, expanded, nameInputRef.current]);

  const cardClassNames = [
    styles.recipientCard,
    expanded && styles.expanded,
    dragging && styles.dragging,
  ].filter(Boolean).join(' ');

  const headerClassNames = [
    styles.recipientHeader,
    toggleDisabled && styles.toggleDisabled,
  ].filter(Boolean).join(' ');


  function handleToggle() {
    if (!toggleDisabled) {
      if (expanded) {
        onCollapse();
      } else {
        onExpand();
      }
    }
  }

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
      >
        <DragHandle />
        <RecipientSummary
          recipient={recipient}
          expanded={expanded}
          nameInputRef={nameInputRef}
          translations={t}
        />
        <RecipientActions
          recipient={recipient}
          expanded={expanded}
          translations={t}
        />
      </div>

      {expanded && (
        <RecipientDetails
          recipient={recipient}
          contactTypeOptions={contactTypeOptions}
          translations={t}
        />
      )}
    </div>
  );
}

export default RecipientCard;
