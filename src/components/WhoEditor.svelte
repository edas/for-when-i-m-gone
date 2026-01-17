<script lang="ts">
  import { untrack, tick } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { updateStoredData } from '../lib/dataStore';
  import { computeButtonStateCustom, getButtonText, type ButtonState } from '../lib/buttonState';
  import {
    handleDragStart as dndDragStart,
    handleDragEnd as dndDragEnd,
    handleDropZoneDragOver as dndDragOver,
    handleDropZoneDragLeave as dndDragLeave,
    handleDrop as dndDrop,
    isDropZoneHidden as dndIsHidden,
    type DragDropState,
  } from '../lib/dragAndDrop';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import TipSection from './ui/TipSection.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import RecipientCard from './ui/RecipientCard.svelte';
  import Icon from './ui/Icons.svelte';
  import '../styles/form-controls.css';
  import '../styles/who-editor.css';
  import {
    type ContactType,
    type ContactInfo,
    type Recipient,
    createEmptyContact,
    createEmptyRecipient,
  } from '../lib/types/recipient';

  interface Props {
    lang: Language;
    initialRecipients?: Recipient[];
    onContinue: (recipients: Recipient[]) => void;
    onBack: (recipients: Recipient[]) => void;
  }

  let { lang, initialRecipients, onContinue, onBack }: Props = $props();

  let recipients: Recipient[] = $state(
    untrack(() => initialRecipients?.length ? [...initialRecipients] : [createEmptyRecipient()])
  );
  let sidePanelOpen: boolean = $state(true);
  let expandedRecipientId: string | null = $state(untrack(() => recipients[0]?.id ?? null));
  let actionButtonsElement: HTMLDivElement | null = $state(null);
  let dragState: DragDropState = $state({ draggedItemId: null, activeDropZone: null });

  function setDragState(state: Partial<DragDropState>): void {
    dragState = { ...dragState, ...state };
  }

  let t = $derived(getTranslations(lang));

  // Derived states
  let hasAtLeast2 = $derived(recipients.length >= 2);
  let hasAtLeast3 = $derived(recipients.length >= 3);
  let hasAtLeast5 = $derived(recipients.length >= 5);
  let unnamedCount = $derived(recipients.filter(r => !r.name.trim()).length);
  let noContactsCount = $derived(recipients.filter(r => 
    !r.contacts.length || r.contacts.every(c => !c.value.trim())
  ).length);
  let allNamed = $derived(recipients.length > 0 && !unnamedCount);
  let allHaveContact = $derived(recipients.length > 0 && !noContactsCount);
  let allEssentialsChecked = $derived(hasAtLeast3 && allNamed && allHaveContact);
  let allHaveAddress = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'address' && c.value.trim())
  ));
  let allHaveEmail = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'email' && c.value.trim())
  ));
  let allHavePhone = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'phone' && c.value.trim())
  ));

  let buttonState = $derived(computeButtonStateCustom(hasAtLeast2, allEssentialsChecked));
  let buttonText = $derived(
    getButtonText(buttonState, {
      continueWithoutEssentials: t.whoEditor.buttons.continueWithoutEssentials,
      continue: t.whoEditor.buttons.continue,
    })
  );

  const CONTACT_TYPES: ContactType[] = [
    'phone', 'email', 'address', 'x', 'bluesky', 'mastodon',
    'facebook', 'telegram', 'whatsapp', 'signal',
    'instagram', 'snapchat', 'linkedin', 'web', 'other',
  ];
  const contactTypeOptions = $derived(
    CONTACT_TYPES.map((type) => ({ value: type, label: t.whoEditor.contactTypes[type] }))
  );

  // Recipient management
  async function addRecipient(): Promise<void> {
    const newRecipient = createEmptyRecipient();
    recipients = [...recipients, newRecipient];
    expandedRecipientId = newRecipient.id;
    await tick();
    await new Promise(resolve => setTimeout(resolve, 150));
    actionButtonsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function removeRecipient(id: string): void {
    const index = recipients.findIndex(r => r.id === id);
    recipients = recipients.filter(r => r.id !== id);
    if (expandedRecipientId === id) {
      expandedRecipientId = recipients[Math.min(index, recipients.length - 1)]?.id ?? null;
    }
  }

  function toggleExpanded(id: string): void {
    expandedRecipientId = expandedRecipientId === id ? null : id;
  }

  function updateRecipient(id: string, field: keyof Omit<Recipient, 'contacts'>, value: string | boolean): void {
    recipients = recipients.map(r => r.id === id ? { ...r, [field]: value } : r);
  }

  function addContact(recipientId: string): void {
    recipients = recipients.map(r => 
      r.id === recipientId ? { ...r, contacts: [...r.contacts, createEmptyContact()] } : r
    );
  }

  function removeContact(recipientId: string, contactId: string): void {
    recipients = recipients.map(r => 
      r.id === recipientId ? { ...r, contacts: r.contacts.filter(c => c.id !== contactId) } : r
    );
  }

  function updateContact(recipientId: string, contactId: string, field: keyof ContactInfo, value: string): void {
    recipients = recipients.map(r => 
      r.id === recipientId 
        ? { ...r, contacts: r.contacts.map(c => c.id === contactId ? { ...c, [field]: value } : c) }
        : r
    );
  }

  function handleContinue(): void {
    if (hasAtLeast2) onContinue(recipients);
  }

  function handleBack(): void {
    onBack(recipients);
  }

  // Drag and drop handlers
  function handleDragStart(e: DragEvent, recipientId: string): void {
    dndDragStart(e, recipientId, setDragState);
  }
  function handleDragEnd(): void {
    dndDragEnd(setDragState);
  }
  function handleDropZoneDragOver(e: DragEvent, insertIndex: number): void {
    dndDragOver(e, insertIndex, dragState.draggedItemId, setDragState);
  }
  function handleDropZoneDragLeave(): void {
    dndDragLeave(setDragState);
  }
  function handleDropZoneDrop(e: DragEvent, insertIndex: number): void {
    const result = dndDrop(e, insertIndex, recipients, dragState.draggedItemId, setDragState);
    if (result) recipients = result;
  }
  function isDropZoneHidden(zoneIndex: number): boolean {
    return dndIsHidden(zoneIndex, recipients, dragState.draggedItemId);
  }

  // Auto-save
  $effect(() => {
    updateStoredData((currentData) => ({
      ...currentData,
      who: { recipients }
    }));
  });
</script>

<EditorLayout
  title={t.whoEditor.title}
  {sidePanelOpen}
  collapseLabel={t.whoEditor.sidePanel.collapse}
  expandLabel={t.whoEditor.sidePanel.expand}
  wideSidePanel
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  <div class="recipients-list" role="list">
    {#each recipients as recipient, index (recipient.id)}
      <div 
        class="drop-zone"
        class:active={dragState.activeDropZone === index}
        class:hidden={isDropZoneHidden(index)}
        role="presentation"
        ondragover={(e) => handleDropZoneDragOver(e, index)}
        ondragleave={handleDropZoneDragLeave}
        ondrop={(e) => handleDropZoneDrop(e, index)}
      >
        <div class="drop-zone-indicator"></div>
      </div>
      
      <RecipientCard
        {recipient}
        expanded={expandedRecipientId === recipient.id}
        dragging={dragState.draggedItemId === recipient.id}
        {contactTypeOptions}
        translations={t.whoEditor}
        onToggle={() => toggleExpanded(recipient.id)}
        onRemove={() => removeRecipient(recipient.id)}
        onUpdateField={(field, value) => updateRecipient(recipient.id, field, value)}
        onAddContact={() => addContact(recipient.id)}
        onRemoveContact={(contactId) => removeContact(recipient.id, contactId)}
        onUpdateContact={(contactId, field, value) => updateContact(recipient.id, contactId, field, value)}
        onDragStart={(e) => handleDragStart(e, recipient.id)}
        onDragEnd={handleDragEnd}
      />
    {/each}
    
    <div 
      class="drop-zone"
      class:active={dragState.activeDropZone === recipients.length}
      class:hidden={isDropZoneHidden(recipients.length)}
      role="presentation"
      ondragover={(e) => handleDropZoneDragOver(e, recipients.length)}
      ondragleave={handleDropZoneDragLeave}
      ondrop={(e) => handleDropZoneDrop(e, recipients.length)}
    >
      <div class="drop-zone-indicator"></div>
    </div>
    
    <button class="add-button large" onclick={addRecipient}>
      <Icon name="plus" size={20} />
      {t.whoEditor.addRecipient}
    </button>
  </div>

  <div bind:this={actionButtonsElement}>
    <ActionButtons
      backLabel={t.common.back}
      continueLabel={buttonText}
      {buttonState}
      disabled={!hasAtLeast2}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  </div>

  {#snippet sidePanelContent()}
    <h2>{t.whoEditor.sidePanel.title}</h2>
    <p class="panel-intro">{t.whoEditor.sidePanel.intro}</p>
    
    <div class="recipient-count">
      <span class="count-number">{recipients.length}</span>
      <div class="count-details">
        <span class="count-label">{t.whoEditor.sidePanel.recipientCount}</span>
        {#if unnamedCount > 0}
          <span class="count-warnings">
            {(unnamedCount > 1 ? t.whoEditor.sidePanel.warnings.unnamedPlural : t.whoEditor.sidePanel.warnings.unnamed)
              .replace('{count}', String(unnamedCount))}
          </span>
        {/if}
        {#if noContactsCount > 0}
          <span class="count-warnings">
            {(unnamedCount > 0 ? t.whoEditor.sidePanel.warnings.noContactsAnd : t.whoEditor.sidePanel.warnings.noContacts)
              .replace('{count}', String(noContactsCount))}
          </span>
        {/if}
      </div>
    </div>

    <EssentialSection note={t.whoEditor.sidePanel.essentialNote}>
      <CheckboxItem checked={hasAtLeast3} label={t.whoEditor.sidePanel.checklist.atLeast3} readonly />
      <CheckboxItem checked={allNamed} label={t.whoEditor.sidePanel.checklist.allNamed} readonly />
      <CheckboxItem checked={allHaveContact} label={t.whoEditor.sidePanel.checklist.allHaveContact} readonly />
    </EssentialSection>

    <div class="optional-section">
      <CheckboxItem checked={hasAtLeast5} label={t.whoEditor.sidePanel.checklist.atLeast5} readonly />
      <CheckboxItem checked={allHaveAddress} label={t.whoEditor.sidePanel.checklist.allHaveAddress} readonly />
      <CheckboxItem checked={allHaveEmail} label={t.whoEditor.sidePanel.checklist.allHaveEmail} readonly />
      <CheckboxItem checked={allHavePhone} label={t.whoEditor.sidePanel.checklist.allHavePhone} readonly />
    </div>

    <TipSection text={t.whoEditor.sidePanel.tip} />
    <TipSection text={t.whoEditor.sidePanel.tip2} />
  {/snippet}
</EditorLayout>
