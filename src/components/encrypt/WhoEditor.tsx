import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';
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
import { EssentialSection } from '../ui/EssentialSection';
import { HelpSection } from '../ui/HelpSection';
import { CheckboxItem } from '../ui/CheckboxItem';
import { RecipientCard } from '../ui/RecipientCard';
import { Icon } from '../ui/Icons';
import formControls from '../../styles/form-controls.module.css';
import styles from './WhoEditor.module.css';
import {
  type ContactType,
  type Recipient,
  createEmptyContact,
  createEmptyRecipient,
} from '../../lib/types/recipient';
import helpStyles from '../ui/HelpSection.module.css';

// Constants
const CONTACT_TYPES: ContactType[] = [
  'phone', 'email', 'address', 'x', 'bluesky', 'mastodon',
  'facebook', 'telegram', 'whatsapp', 'signal',
  'instagram', 'snapchat', 'linkedin', 'web', 'other',
];

// Pure functions for derived state
function computeDerivedState(recipients: Recipient[]) {
  // Filter out hidden recipients (isPrivate === true) for contact checks
  const visibleRecipients = recipients.filter(r => !r.isPrivate);
  const unnamedCount = recipients.filter(r => !r.name.trim()).length;
  
  const hasAtLeast2 = recipients.length >= 2;
  const hasAtLeast3 = recipients.length >= 3;
  const hasAtLeast5 = recipients.length >= 5;
  const allNamed = recipients.length > 0 && !unnamedCount;
  // Only check visible recipients for contact info
  const allHaveContact = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.length > 0 && r.contacts.some(c => c.value.trim())
  );
  
  // Only check visible recipients for contact types
  const allHaveAddress = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.some(c => c.type === 'address' && c.value.trim())
  );
  const allHaveEmail = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.some(c => c.type === 'email' && c.value.trim())
  );
  const allHavePhone = visibleRecipients.length > 0 && visibleRecipients.every(r => 
    r.contacts.some(c => c.type === 'phone' && c.value.trim())
  );

  return {
    unnamedCount,
    hasAtLeast2, hasAtLeast3, hasAtLeast5,
    allNamed, allHaveContact,
    allHaveAddress, allHaveEmail, allHavePhone,
  };
}

function getInitialExpandedId(recipients: Recipient[]): string | null {
  const unnamedRecipient = recipients.find(r => !r.name.trim());
  if (unnamedRecipient) return unnamedRecipient.id;
  if (recipients.length > 1) return null;
  return recipients[0]?.id ?? null;
}

function getInitialState(initialRecipients?: Recipient[]) {
  if (initialRecipients?.length) {
    return {
      recipients: [...initialRecipients],
      expandedId: getInitialExpandedId(initialRecipients),
    };
  }
  const defaultRecipient = createEmptyRecipient();
  return {
    recipients: [defaultRecipient],
    expandedId: defaultRecipient.id,
  };
}

function getVariantAndTitle(
  hasAtLeast2: boolean,
  unnamedCount: number,
  essentials: boolean[],
  optional: boolean[],
  t: TFunction
): { variant: 'error' | 'warning' | 'info' | 'success', title: string } {
  if (unnamedCount > 0) {
    return {
      variant: 'error',
      title: t('whoEditor.sidePanel.unnamedTitle')
    };
  }
  
  if (!hasAtLeast2) {
    return {
      variant: 'error',
      title: t('whoEditor.sidePanel.errorTitle')
    };
  }

  const essentialCount = essentials.filter(Boolean).length;
  const essentialTotal = essentials.length;
  const allCheckedCount = essentialCount + optional.filter(Boolean).length;
  const allTotal = essentialTotal + optional.length;
  const allChecked = allCheckedCount === allTotal;
  const allEssentialChecked = essentialCount === essentialTotal;

  if (allChecked) {
    return {
      variant: 'success',
      title: t('whoEditor.sidePanel.successTitle', { count: allCheckedCount, total: allTotal })
    };
  }
  if (allEssentialChecked) {
    return {
      variant: 'info',
      title: t('whoEditor.sidePanel.infoTitle', { count: allCheckedCount, total: allTotal })
    };
  }
  return {
    variant: 'warning',
    title: t('whoEditor.sidePanel.warningTitle', { count: essentialCount, total: essentialTotal })
  };
}

// Props
interface WhoEditorProps {
  initialRecipients?: Recipient[];
  onContinue: (recipients: Recipient[]) => void;
  onBack: (recipients: Recipient[]) => void;
}

export function WhoEditor({ initialRecipients, onContinue, onBack }: WhoEditorProps) {
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const { t } = useTranslation();
  
  const [initialState] = useState(() => getInitialState(initialRecipients));
  const [recipients, setRecipients] = useState<Recipient[]>(initialState.recipients);
  const [expandedRecipientId, setExpandedRecipientId] = useState<string | null>(initialState.expandedId);
  const [autoFocusRecipientId, setAutoFocusRecipientId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragDropState>({ draggedItemId: null, activeDropZone: null });
  
  const recipientCardRefs = useRef<Record<string, HTMLDivElement>>({});

  // Derived states
  const derived = useMemo(() => computeDerivedState(recipients), [recipients]);
  
  const expandedRecipientHasName = useMemo(() => 
    expandedRecipientId !== null && 
    recipients.find(r => r.id === expandedRecipientId)?.name.trim() !== ''
  , [expandedRecipientId, recipients]);

  // Calculate variant and title for help section
  const essentials = [derived.hasAtLeast3, derived.allNamed, derived.allHaveContact];
  const optional = [derived.hasAtLeast5, derived.allHaveAddress, derived.allHaveEmail, derived.allHavePhone];
  const { variant, title } = getVariantAndTitle(derived.hasAtLeast2, derived.unnamedCount, essentials, optional, t);

  const contactTypeOptions = useMemo(() => 
    CONTACT_TYPES.map((type) => ({ value: type, label: t(`whoEditor.contactTypes.${type}`) }))
  , [t]);

  // Recipient management
  const addRecipient = useCallback(() => {
    const newRecipient = createEmptyRecipient();
    setRecipients(prev => [...prev, newRecipient]);
    setExpandedRecipientId(newRecipient.id);
    setAutoFocusRecipientId(newRecipient.id);
    
    setTimeout(() => {
      recipientCardRefs.current[newRecipient.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => setAutoFocusRecipientId(null), 200);
    }, 150);
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients(prev => {
      const recipient = prev.find(r => r.id === id);
      if (recipient && typeof recipient.number === 'number' && recipient.number > 0) return prev;
      
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
    if (!expandedRecipientHasName && expandedRecipientId !== null) return;
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

  // Drag and drop
  const updateDragState = useCallback((state: Partial<DragDropState>) => {
    setDragState(prev => ({ ...prev, ...state }));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, recipientId: string) => {
    dndDragStart(e as unknown as DragEvent, recipientId, updateDragState);
  }, [updateDragState]);

  const handleDragEnd = useCallback(() => dndDragEnd(updateDragState), [updateDragState]);

  const handleDropZoneDragOver = useCallback((e: React.DragEvent, insertIndex: number) => {
    dndDragOver(e as unknown as DragEvent, insertIndex, dragState.draggedItemId, updateDragState);
  }, [dragState.draggedItemId, updateDragState]);

  const handleDropZoneDragLeave = useCallback(() => dndDragLeave(updateDragState), [updateDragState]);

  const handleDropZoneDrop = useCallback((e: React.DragEvent, insertIndex: number) => {
    const result = dndDrop(e as unknown as DragEvent, insertIndex, recipients, dragState.draggedItemId, updateDragState);
    if (result) setRecipients(result);
  }, [recipients, dragState.draggedItemId, updateDragState]);

  const isDropZoneHidden = useCallback((zoneIndex: number) => 
    dndIsHidden(zoneIndex, recipients, dragState.draggedItemId)
  , [recipients, dragState.draggedItemId]);

  // Auto-save
  useEffect(() => {
    setData(() => ({ who: { recipients } }));
  }, [recipients, setData]);

  // Auto focus on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (expandedRecipientId !== null) {
        const expandedRecipient = recipients.find(r => r.id === expandedRecipientId);
        if (expandedRecipient && !expandedRecipient.name.trim()) {
          setAutoFocusRecipientId(expandedRecipient.id);
          setTimeout(() => setAutoFocusRecipientId(null), 400);
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const canToggle = expandedRecipientId === null || expandedRecipientHasName;

  return (
    <EditorLayout title={t('whoEditor.title')}>
      <p className={styles.description}>{t('whoEditor.description')}</p>
      <div className={styles.contentWrapper}>
        <RecipientsList
          recipients={recipients}
          expandedRecipientId={expandedRecipientId}
          autoFocusRecipientId={autoFocusRecipientId}
          dragState={dragState}
          contactTypeOptions={contactTypeOptions}
          canToggle={canToggle}
          recipientCardRefs={recipientCardRefs}
          onToggle={toggleExpanded}
          onRemove={removeRecipient}
          onUpdate={updateRecipient}
          onAddContact={addContact}
          onRemoveContact={removeContact}
          onUpdateContact={updateContact}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDropZoneDrop}
          isDropZoneHidden={isDropZoneHidden}
          onAddRecipient={addRecipient}
        />

        <HelpContent derived={derived} title={title} />

        <ActionButtons
          backLabel={t('common.back')}
          continueLabel={t('common.continue')}
          buttonState={derived.hasAtLeast2 ? "complete" : "none"}
          disabled={!derived.hasAtLeast2 || !canToggle}
          onBack={() => onBack(recipients)}
          onContinue={() => derived.hasAtLeast2 && onContinue(recipients)}
          variant={variant}
        />
      </div>
    </EditorLayout>
  );
}

export default WhoEditor;

// Sub-components

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

function RecipientsList({
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

interface DropZoneProps {
  index: number;
  isActive: boolean;
  isHidden: boolean;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

function DropZone({ index, isActive, isHidden, onDragOver, onDragLeave, onDrop }: DropZoneProps) {
  return (
    <div 
      className={`${styles.dropZone} ${isActive ? styles.active : ''} ${isHidden ? styles.hidden : ''}`}
      role="presentation"
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className={styles.dropZoneIndicator}></div>
    </div>
  );
}

interface HelpContentProps {
  derived: ReturnType<typeof computeDerivedState>;
  title: string;
}

function HelpContent({ derived, title }: HelpContentProps) {
  const { t } = useTranslation();
  const { hasAtLeast3, hasAtLeast5, allNamed, allHaveContact, allHaveAddress, allHaveEmail, allHavePhone } = derived;

  return (
    <HelpSection title={title}>     
      <EssentialSection note={t('whoEditor.sidePanel.essentialNote')}>
        <CheckboxItem checked={hasAtLeast3} label={t('whoEditor.sidePanel.checklist.atLeast3')} readonly />
        <CheckboxItem checked={allNamed} label={t('whoEditor.sidePanel.checklist.allNamed')} readonly />
        <CheckboxItem checked={allHaveContact} label={t('whoEditor.sidePanel.checklist.allHaveContact')} readonly />
      </EssentialSection>

      <div className={formControls.optionalSection}>
        <CheckboxItem checked={hasAtLeast5} label={t('whoEditor.sidePanel.checklist.atLeast5')} readonly />
        <CheckboxItem checked={allHaveAddress} label={t('whoEditor.sidePanel.checklist.allHaveAddress')} readonly />
        <CheckboxItem checked={allHaveEmail} label={t('whoEditor.sidePanel.checklist.allHaveEmail')} readonly />
        <CheckboxItem checked={allHavePhone} label={t('whoEditor.sidePanel.checklist.allHavePhone')} readonly />

        <p className={helpStyles.panelIntro}>{t('whoEditor.sidePanel.tip2')}</p> 
        <p className={helpStyles.panelIntro}>{t('whoEditor.sidePanel.tip')}</p> 
      </div>
    </HelpSection>
  );
}
