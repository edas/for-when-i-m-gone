import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RecipientCard } from '../ui/RecipientCard';
import { Icon } from '../ui/Icons';
import formControls from '../../styles/form-controls.module.css';
import styles from './WhoEditor.module.css';
import { DropZone } from './WhoEditorDropZone';
import { useEncryptDataStore } from '../../lib/dataStore';
import { useRecipientActions } from './useRecipients';
import { useDragAndDrop } from './useDragAndDrop';
import { Recipient } from '../../lib/types/recipient';
import { CONTACT_TYPES } from './whoEditorUtils';



export function RecipientsList() {
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

  const recipientCardRefs = useRef<Record<string, HTMLDivElement>>({});
  const recipients: Recipient[] = useEncryptDataStore((state) => state.who?.recipients ?? []);
  const [expandedRecipientId, setExpandedRecipientId] = useState<string | null>(null);
  const [autoFocusRecipientId, setAutoFocusRecipientId] = useState<string | null>(null);
  const expandedRecipient = recipients.find(recipient => recipient.id === expandedRecipientId);
  const canToggle = expandedRecipient ? expandedRecipient.name.trim() !== '' : true;

  const contactTypeOptions = useMemo(() => 
    CONTACT_TYPES.map((type) => ({ value: type, label: t(`whoEditor.contactTypes.${type}`) }))
  , [t]);
  
  const { 
    setRecipients,
    addNewRecipient,
  } = useRecipientActions();

  const {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDropZoneDragOver,
    handleDropZoneDragLeave,
    handleDropZoneDrop,
    isDropZoneHidden,
   } = useDragAndDrop(recipients, setRecipients);

  useEffect(() => {
    // on ouvre le destinataire incomplet (non nommé) ou en crée un s'il n'y en a pas
    const rec = recipients.find(recipient => recipient.name.trim() == '')
    if (rec) {
      setExpandedRecipientId(rec.id)
      setAutoFocusRecipientId(rec.id)
    } else if (recipients.length == 0) {
      console.log('create new recipient because there are no recipients');
      const newRecipient = addNewRecipient()
      setExpandedRecipientId(newRecipient.id)
      setAutoFocusRecipientId(newRecipient.id)
    }
  }, []);
  
  return (
    <div className={styles.recipientsList} role="list">
      {recipients.map((recipient, index) => (
        <div key={recipient.id}>
          <DropZone
            index={index}
            isActive={dragState.activeDropZone === index}
            isHidden={isDropZoneHidden(index)}
            onDragOver={ handleDropZoneDragOver}
            onDragLeave={ handleDropZoneDragLeave}
            onDrop={ handleDropZoneDrop}
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
              onDragStart={(e) => handleDragStart(e, recipient.id)}
              onDragEnd={handleDragEnd}
              onExpand={() => { setExpandedRecipientId(recipient.id); setAutoFocusRecipientId(null); }}
              onCollapse={() => { setExpandedRecipientId(null); setAutoFocusRecipientId(null); }}
            />
          </div>
        </div>
      ))}
      
      <DropZone
        index={recipients.length}
        isActive={dragState.activeDropZone === recipients.length}
        isHidden={isDropZoneHidden(recipients.length)}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={handleDropZoneDrop}
      />
      
      <button 
        className={`${formControls.addButton} ${formControls.addButtonLarge}`} 
        onClick={() => {
          const newRecipient = addNewRecipient()
          setExpandedRecipientId(newRecipient.id)
          setAutoFocusRecipientId(newRecipient.id)
        }}
        disabled={!canToggle}
      >
        <Icon name="plus" size={20} />
        {t('whoEditor.addRecipient')}
      </button>
    </div>
  );
}
