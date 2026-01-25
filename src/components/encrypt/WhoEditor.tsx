import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EncryptStoreActions, useEncryptDataStore } from '../../lib/dataStore';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import styles from './WhoEditor.module.css';
import { type Recipient } from '../../lib/types/recipient';
import { useRecipients } from './useRecipients';
import { useDragAndDrop } from './useDragAndDrop';
import { computeDerivedState, getVariantAndTitle, CONTACT_TYPES } from './whoEditorUtils';
import { RecipientsList } from './WhoEditorRecipientsList';
import { WhoEditorHelpContent } from './WhoEditorHelpContent';

interface WhoEditorProps {
  initialRecipients?: Recipient[];
  onContinue: (recipients: Recipient[]) => void;
  onBack: (recipients: Recipient[]) => void;
}

export function WhoEditor({ initialRecipients, onContinue, onBack }: WhoEditorProps) {
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);
  const { t } = useTranslation();
  
  const {
    recipients,
    setRecipients,
    expandedRecipientId,
    autoFocusRecipientId,
    recipientCardRefs,
    canToggle,
    addRecipient,
    removeRecipient,
    toggleExpanded,
    updateRecipient,
    addContact,
    removeContact,
    updateContact,
  } = useRecipients(initialRecipients);

  const {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDropZoneDragOver,
    handleDropZoneDragLeave,
    handleDropZoneDrop,
    isDropZoneHidden,
  } = useDragAndDrop(recipients, setRecipients);

  // Derived states
  const derived = useMemo(() => computeDerivedState(recipients), [recipients]);

  // Calculate variant and title for help section
  const essentials = [derived.hasAtLeast3, derived.allNamed, derived.allHaveContact];
  const optional = [derived.hasAtLeast5, derived.allHaveAddress, derived.allHaveEmail, derived.allHavePhone];
  const { variant, title } = getVariantAndTitle(derived.hasAtLeast2, derived.unnamedCount, essentials, optional, t);

  const contactTypeOptions = useMemo(() => 
    CONTACT_TYPES.map((type) => ({ value: type, label: t(`whoEditor.contactTypes.${type}`) }))
  , [t]);

  // Auto-save
  useEffect(() => {
    setData(() => ({ who: { recipients } }));
  }, [recipients, setData]);

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

        <WhoEditorHelpContent recipients={recipients} title={title} />

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
