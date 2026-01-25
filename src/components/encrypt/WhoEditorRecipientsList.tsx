import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type ContactType, type Recipient } from '../../lib/types/recipient';
import { type DragDropState } from '../../lib/dragAndDrop';
import { RecipientCard } from '../ui/RecipientCard';
import { Icon } from '../ui/Icons';
import formControls from '../../styles/form-controls.module.css';
import styles from './WhoEditor.module.css';
import { DropZone } from './WhoEditorDropZone';

interface RecipientsListProps {
  recipients: Recipient[];
  expandedRecipientId: string | null;
  autoFocusRecipientId: string | null;
  dragState: DragDropState;
  contactTypeOptions: { value: ContactType; label: string }[];
  canToggle: boolean;
  recipientCardRefs: React.MutableRefObject<Record<string, HTMLDivElement>>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Omit<Recipient, 'contacts'>, value: string | boolean) => void;
  onAddContact: (recipientId: string) => void;
  onRemoveContact: (recipientId: string, contactId: string) => void;
  onUpdateContact: (recipientId: string, contactId: string, field: 'type' | 'value', value: string) => void;
  onDragStart: (e: React.DragEvent, recipientId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, insertIndex: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, insertIndex: number) => void;
  isDropZoneHidden: (zoneIndex: number) => boolean;
  onAddRecipient: () => void;
}

export function RecipientsList({
  recipients, expandedRecipientId, autoFocusRecipientId, dragState,
  contactTypeOptions, canToggle, recipientCardRefs,
  onToggle, onRemove, onUpdate, onAddContact, onRemoveContact, onUpdateContact,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, isDropZoneHidden, onAddRecipient,
}: RecipientsListProps) {
  const { t } = useTranslation();
  
  const translations = useMemo(() => ({
    newRecipient: t('whoEditor.newRecipient'),
    addRecipient: t('whoEditor.addRecipient'),
    removeRecipient: t('whoEditor.removeRecipient'),
    addContact: t('whoEditor.addContact'),
    removeContact: t('whoEditor.removeContact'),
    fields: {
      name: t('whoEditor.fields.name'),
      contacts: t('whoEditor.fields.contacts'),
      notListedPublicly: t('whoEditor.fields.notListedPublicly'),
      privateInfo: t('whoEditor.fields.privateInfo'),
      numberedInfo: t('whoEditor.fields.numberedInfo'),
    },
    placeholders: {
      name: t('whoEditor.placeholders.name'),
      contactValue: t('whoEditor.placeholders.contactValue'),
      contactComment: t('whoEditor.placeholders.contactComment'),
    },
  }), [t]);

  return (
    <div className={styles.recipientsList} role="list">
      {recipients.map((recipient, index) => (
        <div key={recipient.id}>
          <DropZone
            index={index}
            isActive={dragState.activeDropZone === index}
            isHidden={isDropZoneHidden(index)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
          
          <div ref={(el) => { if (el) recipientCardRefs.current[recipient.id] = el; }}>
            <RecipientCard
              recipient={recipient}
              expanded={expandedRecipientId === recipient.id}
              dragging={dragState.draggedItemId === recipient.id}
              contactTypeOptions={contactTypeOptions}
              translations={translations}
              autoFocus={autoFocusRecipientId === recipient.id}
              toggleDisabled={!canToggle}
              onToggle={() => onToggle(recipient.id)}
              onRemove={() => onRemove(recipient.id)}
              onUpdateField={(field, value) => onUpdate(recipient.id, field, value)}
              onAddContact={() => onAddContact(recipient.id)}
              onRemoveContact={(contactId) => onRemoveContact(recipient.id, contactId)}
              onUpdateContact={(contactId, field, value) => onUpdateContact(recipient.id, contactId, field, value)}
              onDragStart={(e) => onDragStart(e, recipient.id)}
              onDragEnd={onDragEnd}
            />
          </div>
        </div>
      ))}
      
      <DropZone
        index={recipients.length}
        isActive={dragState.activeDropZone === recipients.length}
        isHidden={isDropZoneHidden(recipients.length)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />
      
      <button 
        className={`${formControls.addButton} ${formControls.addButtonLarge}`} 
        onClick={onAddRecipient}
        disabled={!canToggle}
      >
        <Icon name="plus" size={20} />
        {t('whoEditor.addRecipient')}
      </button>
    </div>
  );
}
