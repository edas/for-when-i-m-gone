import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../lib/DataContext';
import { computeButtonStateCustom, getButtonText } from '../../lib/buttonState';
import {
  handleDragStart as dndDragStart,
  handleDragEnd as dndDragEnd,
  handleDropZoneDragOver as dndDragOver,
  handleDropZoneDragLeave as dndDragLeave,
  handleDrop as dndDrop,
  isDropZoneHidden as dndIsHidden,
  type DragDropState,
} from '../../lib/dragAndDrop';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import { TipSection } from '../ui/TipSection';
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import { CheckboxItem } from '../ui/CheckboxItem';
import { RecipientCard } from '../ui/RecipientCard';
import { Icon } from '../ui/Icons';
import '../../styles/form-controls.css';
import '../../styles/who-editor.css';
import {
  type ContactType,
  type Recipient,
  createEmptyContact,
  createEmptyRecipient,
} from '../../lib/types/recipient';

interface WhoEditorProps {
  initialRecipients?: Recipient[];
  onContinue: (recipients: Recipient[]) => void;
  onBack: (recipients: Recipient[]) => void;
}

export function WhoEditor({ initialRecipients, onContinue, onBack }: WhoEditorProps) {
  const { updateStoredData } = useData();
  const { t } = useTranslation();
  
  const getInitialExpandedId = (recipients: Recipient[]): string | null => {
    const unnamedRecipient = recipients.find(r => !r.name.trim());
    if (unnamedRecipient) return unnamedRecipient.id;
    if (recipients.length > 1) return null;
    return recipients[0]?.id ?? null;
  };

  // Fonction d'initialisation qui crée le recipient par défaut une seule fois
  const getInitialState = () => {
    if (initialRecipients?.length) {
      return {
        recipients: [...initialRecipients],
        expandedId: getInitialExpandedId(initialRecipients),
      };
    }
    // Créer le recipient par défaut une seule fois
    const defaultRecipient = createEmptyRecipient();
    return {
      recipients: [defaultRecipient],
      expandedId: defaultRecipient.id, // Toujours étendre le recipient par défaut
    };
  };

  const initialState = getInitialState();
  const [recipients, setRecipients] = useState<Recipient[]>(initialState.recipients);
  const [expandedRecipientId, setExpandedRecipientId] = useState<string | null>(initialState.expandedId);
  const [autoFocusRecipientId, setAutoFocusRecipientId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragDropState>({ draggedItemId: null, activeDropZone: null });
  
  const recipientCardRefs = useRef<Record<string, HTMLDivElement>>({});

  // Derived states
  const hasAtLeast2 = useMemo(() => recipients.length >= 2, [recipients]);
  const hasAtLeast3 = useMemo(() => recipients.length >= 3, [recipients]);
  const hasAtLeast5 = useMemo(() => recipients.length >= 5, [recipients]);
  const unnamedCount = useMemo(() => recipients.filter(r => !r.name.trim()).length, [recipients]);
  const noContactsCount = useMemo(() => recipients.filter(r => 
    !r.contacts.length || r.contacts.every(c => !c.value.trim())
  ).length, [recipients]);
  const allNamed = useMemo(() => recipients.length > 0 && !unnamedCount, [recipients, unnamedCount]);
  const allHaveContact = useMemo(() => recipients.length > 0 && !noContactsCount, [recipients, noContactsCount]);
  const allEssentialsChecked = useMemo(() => hasAtLeast3 && allNamed && allHaveContact, [hasAtLeast3, allNamed, allHaveContact]);
  const allHaveAddress = useMemo(() => recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'address' && c.value.trim())
  ), [recipients]);
  const allHaveEmail = useMemo(() => recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'email' && c.value.trim())
  ), [recipients]);
  const allHavePhone = useMemo(() => recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'phone' && c.value.trim())
  ), [recipients]);
  
  const expandedRecipientHasName = useMemo(() => 
    expandedRecipientId !== null && 
    recipients.find(r => r.id === expandedRecipientId)?.name.trim() !== ''
  , [expandedRecipientId, recipients]);

  const buttonState = useMemo(() => computeButtonStateCustom(hasAtLeast2, allEssentialsChecked), [hasAtLeast2, allEssentialsChecked]);
  const buttonTexts = useMemo(() => ({
    continueWithoutEssentials: t('whoEditor.buttons.continueWithoutEssentials'),
    continue: t('whoEditor.buttons.continue'),
  }), [t]);
  const buttonText = useMemo(() => getButtonText(buttonState, buttonTexts), [buttonState, buttonTexts]);

  const CONTACT_TYPES: ContactType[] = [
    'phone', 'email', 'address', 'x', 'bluesky', 'mastodon',
    'facebook', 'telegram', 'whatsapp', 'signal',
    'instagram', 'snapchat', 'linkedin', 'web', 'other',
  ];
  const contactTypeOptions = useMemo(() => 
    CONTACT_TYPES.map((type) => ({ value: type, label: t(`whoEditor.contactTypes.${type}`) }))
  , [t]);

  // Recipient management
  const addRecipient = useCallback(async () => {
    const newRecipient = createEmptyRecipient();
    setRecipients(prev => [...prev, newRecipient]);
    setExpandedRecipientId(newRecipient.id);
    setAutoFocusRecipientId(newRecipient.id);
    
    setTimeout(() => {
      const newCardElement = recipientCardRefs.current[newRecipient.id];
      if (newCardElement) {
        newCardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      setTimeout(() => setAutoFocusRecipientId(null), 200);
    }, 150);
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients(prev => {
      const recipient = prev.find(r => r.id === id);
      if (recipient && typeof recipient.number === 'number' && recipient.number > 0) {
        return prev;
      }
      const index = prev.findIndex(r => r.id === id);
      const filtered = prev.filter(r => r.id !== id);
      delete recipientCardRefs.current[id];
      
      if (expandedRecipientId === id) {
        setExpandedRecipientId(filtered[Math.min(index, filtered.length - 1)]?.id ?? null);
      }
      return filtered;
    });
  }, [expandedRecipientId]);

  const toggleExpanded = useCallback((id: string) => {
    if (expandedRecipientId !== null && expandedRecipientId !== id && !expandedRecipientHasName) {
      return;
    }
    if (expandedRecipientId === id && !expandedRecipientHasName) {
      return;
    }
    setExpandedRecipientId(prev => prev === id ? null : id);
  }, [expandedRecipientId, expandedRecipientHasName]);

  const updateRecipient = useCallback((id: string, field: keyof Omit<Recipient, 'contacts'>, value: string | boolean) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const addContact = useCallback((recipientId: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === recipientId ? { ...r, contacts: [...r.contacts, createEmptyContact()] } : r
    ));
  }, []);

  const removeContact = useCallback((recipientId: string, contactId: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === recipientId ? { ...r, contacts: r.contacts.filter(c => c.id !== contactId) } : r
    ));
  }, []);

  const updateContact = useCallback((recipientId: string, contactId: string, field: 'type' | 'value', value: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === recipientId 
        ? { ...r, contacts: r.contacts.map(c => c.id === contactId ? { ...c, [field]: value } : c) }
        : r
    ));
  }, []);

  const handleContinue = useCallback(() => {
    if (hasAtLeast2) onContinue(recipients);
  }, [hasAtLeast2, recipients, onContinue]);

  const handleBack = useCallback(() => {
    onBack(recipients);
  }, [recipients, onBack]);

  // Drag and drop handlers
  const updateDragState = useCallback((state: Partial<DragDropState>) => {
    setDragState(prev => ({ ...prev, ...state }));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, recipientId: string) => {
    dndDragStart(e as unknown as DragEvent, recipientId, updateDragState);
  }, [updateDragState]);

  const handleDragEnd = useCallback(() => {
    dndDragEnd(updateDragState);
  }, [updateDragState]);

  const handleDropZoneDragOver = useCallback((e: React.DragEvent, insertIndex: number) => {
    dndDragOver(e as unknown as DragEvent, insertIndex, dragState.draggedItemId, updateDragState);
  }, [dragState.draggedItemId, updateDragState]);

  const handleDropZoneDragLeave = useCallback(() => {
    dndDragLeave(updateDragState);
  }, [updateDragState]);

  const handleDropZoneDrop = useCallback((e: React.DragEvent, insertIndex: number) => {
    const result = dndDrop(e as unknown as DragEvent, insertIndex, recipients, dragState.draggedItemId, updateDragState);
    if (result) setRecipients(result);
  }, [recipients, dragState.draggedItemId, updateDragState]);

  const isDropZoneHidden = useCallback((zoneIndex: number) => {
    return dndIsHidden(zoneIndex, recipients, dragState.draggedItemId);
  }, [recipients, dragState.draggedItemId]);

  // Auto-save
  useEffect(() => {
    updateStoredData((currentData) => ({
      ...currentData,
      who: { recipients }
    }));
  }, [recipients, updateStoredData]);

  // Auto focus on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (expandedRecipientId !== null && recipients.length > 0) {
        const expandedRecipient = recipients.find(r => r.id === expandedRecipientId);
        if (expandedRecipient && !expandedRecipient.name.trim()) {
          setAutoFocusRecipientId(expandedRecipient.id);
          setTimeout(() => setAutoFocusRecipientId(null), 400);
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const helpContent = (
    <>
      <p className="panel-intro">{t('whoEditor.sidePanel.intro')}</p>
      
      <div className="recipient-count">
        <span className="count-number">{recipients.length}</span>
        <div className="count-details">
          <span className="count-label">{t('whoEditor.sidePanel.recipientCount')}</span>
          {unnamedCount > 0 && (
            <span className="count-warnings">
              {t(unnamedCount > 1 ? 'whoEditor.sidePanel.warnings.unnamedPlural' : 'whoEditor.sidePanel.warnings.unnamed', { count: unnamedCount })}
            </span>
          )}
          {noContactsCount > 0 && (
            <span className="count-warnings">
              {t(unnamedCount > 0 ? 'whoEditor.sidePanel.warnings.noContactsAnd' : 'whoEditor.sidePanel.warnings.noContacts', { count: noContactsCount })}
            </span>
          )}
        </div>
      </div>

      <EssentialSection note={t('whoEditor.sidePanel.essentialNote')}>
        <CheckboxItem checked={hasAtLeast3} label={t('whoEditor.sidePanel.checklist.atLeast3')} readonly />
        <CheckboxItem checked={allNamed} label={t('whoEditor.sidePanel.checklist.allNamed')} readonly />
        <CheckboxItem checked={allHaveContact} label={t('whoEditor.sidePanel.checklist.allHaveContact')} readonly />
      </EssentialSection>

      <div className="optional-section">
        <CheckboxItem checked={hasAtLeast5} label={t('whoEditor.sidePanel.checklist.atLeast5')} readonly />
        <CheckboxItem checked={allHaveAddress} label={t('whoEditor.sidePanel.checklist.allHaveAddress')} readonly />
        <CheckboxItem checked={allHaveEmail} label={t('whoEditor.sidePanel.checklist.allHaveEmail')} readonly />
        <CheckboxItem checked={allHavePhone} label={t('whoEditor.sidePanel.checklist.allHavePhone')} readonly />
      </div>

      <TipSection text={t('whoEditor.sidePanel.tip')} />
      <TipSection text={t('whoEditor.sidePanel.tip2')} />
    </>
  );

  // Create translations object for RecipientCard
  const recipientCardTranslations = useMemo(() => ({
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
    <EditorLayout title={t('whoEditor.title')}>
      <div className="content-wrapper">
        <div className="recipients-list" role="list">
          {recipients.map((recipient, index) => (
            <div key={recipient.id}>
              <div 
                className={`drop-zone ${dragState.activeDropZone === index ? 'active' : ''} ${isDropZoneHidden(index) ? 'hidden' : ''}`}
                role="presentation"
                onDragOver={(e) => handleDropZoneDragOver(e, index)}
                onDragLeave={handleDropZoneDragLeave}
                onDrop={(e) => handleDropZoneDrop(e, index)}
              >
                <div className="drop-zone-indicator"></div>
              </div>
              
              <div ref={(el) => { if (el) recipientCardRefs.current[recipient.id] = el; }}>
                <RecipientCard
                  recipient={recipient}
                  expanded={expandedRecipientId === recipient.id}
                  dragging={dragState.draggedItemId === recipient.id}
                  contactTypeOptions={contactTypeOptions}
                  translations={recipientCardTranslations}
                  autoFocus={autoFocusRecipientId === recipient.id}
                  toggleDisabled={expandedRecipientId !== null && !expandedRecipientHasName}
                  onToggle={() => toggleExpanded(recipient.id)}
                  onRemove={() => removeRecipient(recipient.id)}
                  onUpdateField={(field, value) => updateRecipient(recipient.id, field, value)}
                  onAddContact={() => addContact(recipient.id)}
                  onRemoveContact={(contactId) => removeContact(recipient.id, contactId)}
                  onUpdateContact={(contactId, field, value) => updateContact(recipient.id, contactId, field, value)}
                  onDragStart={(e) => handleDragStart(e, recipient.id)}
                  onDragEnd={handleDragEnd}
                />
              </div>
            </div>
          ))}
          
          <div 
            className={`drop-zone ${dragState.activeDropZone === recipients.length ? 'active' : ''} ${isDropZoneHidden(recipients.length) ? 'hidden' : ''}`}
            role="presentation"
            onDragOver={(e) => handleDropZoneDragOver(e, recipients.length)}
            onDragLeave={handleDropZoneDragLeave}
            onDrop={(e) => handleDropZoneDrop(e, recipients.length)}
          >
            <div className="drop-zone-indicator"></div>
          </div>
          
          <button 
            className="add-button large" 
            onClick={addRecipient}
            disabled={expandedRecipientId !== null && !expandedRecipientHasName}
          >
            <Icon name="plus" size={20} />
            {t('whoEditor.addRecipient')}
          </button>
        </div>

        <HelpSection title={t('whoEditor.sidePanel.title')}>
          {helpContent}
        </HelpSection>

        <ActionButtons
          backLabel={t('common.back')}
          continueLabel={buttonText}
          buttonState={buttonState}
          disabled={!hasAtLeast2 || (expandedRecipientId !== null && !expandedRecipientHasName)}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      </div>
    </EditorLayout>
  );
}

export default WhoEditor;
