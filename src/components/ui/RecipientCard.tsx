import { useEffect, useRef, KeyboardEvent, MouseEvent, DragEvent } from 'react';
import type { Recipient } from '../../lib/types/recipient';
import { ContactRow } from './ContactRow';
import { Icon } from './Icons';
import './RecipientCard.css';

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
    'recipient-card',
    expanded && 'expanded',
    dragging && 'dragging',
  ].filter(Boolean).join(' ');

  const headerClassNames = [
    'recipient-header',
    toggleDisabled && 'toggle-disabled',
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
          className="drag-handle"
          role="presentation"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Icon name="grip-vertical" size={18} />
        </div>
        <div className="recipient-summary">
          {expanded ? (
            <div className="name-input-wrapper">
              <input
                ref={nameInputRef}
                id={`name-${recipient.id}`}
                type="text"
                className="form-input recipient-name-input"
                value={recipient.name}
                onChange={(e) => onUpdateField('name', e.target.value)}
                placeholder={t.placeholders.name}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
              {recipient.isPrivate ? (
                <div className="private-info-message">
                  {t.fields.privateInfo}
                </div>
              ) : recipient.number ? (
                <div className="private-info-message">
                  {t.fields.numberedInfo}
                </div>
              ) : null}
            </div>
          ) : (
            <span className={`recipient-name ${recipient.isPrivate ? 'private' : ''}`}>
              {recipient.name || t.newRecipient}
              {recipient.number !== undefined && (
                <span className="recipient-number"> (#{recipient.number})</span>
              )}
            </span>
          )}
        </div>
        <div className="recipient-actions">
          {expanded && (
            <button
              className="private-toggle-button"
              onClick={handlePrivateToggle}
              title={t.fields.notListedPublicly}
            >
              <Icon name={recipient.isPrivate ? 'eye-off' : 'eye'} size={18} />
            </button>
          )}
          {expanded && !recipient.number && (
            <button
              className="remove-button large"
              onClick={handleRemoveClick}
              title={t.removeRecipient}
            >
              <Icon name="minus" size={16} />
            </button>
          )}
          <span className={`expand-icon ${expanded ? 'rotated' : ''}`}>
            <Icon name="chevron-right" size={20} />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="recipient-details">
          <div className="contacts-section">
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

            <button className="add-button" onClick={onAddContact}>
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
