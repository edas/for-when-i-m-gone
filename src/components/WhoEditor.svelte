<script lang="ts">
  import { untrack, tick } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import { type ButtonState } from '../lib/buttonState';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import TipSection from './ui/TipSection.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import Icon from './ui/Icons.svelte';

  export type ContactType = 
    | 'phone' 
    | 'email' 
    | 'address' 
    | 'x' 
    | 'bluesky' 
    | 'mastodon' 
    | 'facebook' 
    | 'telegram' 
    | 'whatsapp' 
    | 'signal'
    | 'instagram' 
    | 'snapchat' 
    | 'linkedin' 
    | 'web' 
    | 'other';

  export interface ContactInfo {
    id: string;
    type: ContactType;
    value: string;
    comment: string;
  }

  export interface Recipient {
    id: string;
    name: string;
    contacts: ContactInfo[];
  }

  export function createEmptyContact(): ContactInfo {
    return {
      id: crypto.randomUUID(),
      type: 'phone',
      value: '',
      comment: '',
    };
  }

  export function createEmptyRecipient(): Recipient {
    return {
      id: crypto.randomUUID(),
      name: '',
      contacts: [
        { ...createEmptyContact(), type: 'phone' },
        { ...createEmptyContact(), type: 'email' },
        { ...createEmptyContact(), type: 'address' },
      ],
    };
  }

  interface Props {
    lang: Language;
    initialRecipients?: Recipient[];
    onContinue: (recipients: Recipient[]) => void;
    onBack: (recipients: Recipient[]) => void;
  }

  let { lang, initialRecipients, onContinue, onBack }: Props = $props();

  let recipients: Recipient[] = $state(
    untrack(() => {
      if (initialRecipients && initialRecipients.length > 0) {
        return [...initialRecipients];
      }
      return [createEmptyRecipient()];
    })
  );
  let sidePanelOpen: boolean = $state(true);
  let expandedRecipientId: string | null = $state(
    untrack(() => recipients[0]?.id ?? null)
  );
  let recipientsListElement: HTMLDivElement | null = $state(null);
  let actionButtonsElement: HTMLDivElement | null = $state(null);

  // Drag and drop state
  let draggedRecipientId: string | null = $state(null);
  let activeDropZone: number | null = $state(null); // Index where the item would be inserted

  let t = $derived(getTranslations(lang));

  // Count recipients with a name (valid recipients for passing to next step)
  let namedRecipients = $derived(recipients.filter(r => r.name.trim().length > 0));
  
  // Count all recipients
  let totalRecipientCount = $derived(recipients.length);
  
  // Check if at least 2 recipients are listed (for button clickability)
  let hasAtLeast2 = $derived(recipients.length >= 2);
  
  // Count unnamed recipients
  let unnamedCount = $derived(recipients.filter(r => r.name.trim().length === 0).length);
  
  // Count recipients without any contact info (no contacts or all contacts have empty values)
  let noContactsCount = $derived(recipients.filter(r => 
    r.contacts.length === 0 || r.contacts.every(c => c.value.trim().length === 0)
  ).length);

  // Checklist conditions (essential)
  let hasAtLeast3 = $derived(recipients.length >= 3);
  let allNamed = $derived(recipients.length > 0 && recipients.every(r => r.name.trim().length > 0));
  let allHaveContact = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.value.trim().length > 0)
  ));
  let allEssentialsChecked = $derived(hasAtLeast3 && allNamed && allHaveContact);
  let anyChecked = $derived(hasAtLeast3 || allNamed || allHaveContact);

  // Button state - based on total recipients count
  let buttonState = $derived.by((): ButtonState => {
    if (!hasAtLeast2) return 'none';
    return allEssentialsChecked ? 'complete' : 'partial';
  });
  let buttonText = $derived(hasAtLeast2 
    ? (allEssentialsChecked ? t.whoEditor.buttons.continue : t.whoEditor.buttons.continueWithoutEssentials)
    : t.whoEditor.buttons.continue
  );

  // Checklist conditions (optional)
  let hasAtLeast5 = $derived(recipients.length >= 5);
  let allHaveAddress = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'address' && c.value.trim().length > 0)
  ));
  let allHaveEmail = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'email' && c.value.trim().length > 0)
  ));
  let allHavePhone = $derived(recipients.length > 0 && recipients.every(r => 
    r.contacts.some(c => c.type === 'phone' && c.value.trim().length > 0)
  ));

  async function addRecipient(): Promise<void> {
    const newRecipient = createEmptyRecipient();
    recipients = [...recipients, newRecipient];
    expandedRecipientId = newRecipient.id;
    
    // Scroll to bottom after DOM update
    await tick();
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Scroll so action buttons appear near the top of view (leaves margin below)
    if (actionButtonsElement) {
      actionButtonsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function removeRecipient(id: string): void {
    const index = recipients.findIndex(r => r.id === id);
    recipients = recipients.filter(r => r.id !== id);
    // If we removed the expanded one, expand the previous or next
    if (expandedRecipientId === id) {
      const newIndex = Math.min(index, recipients.length - 1);
      expandedRecipientId = recipients[newIndex]?.id ?? null;
    }
  }

  function toggleExpanded(id: string): void {
    expandedRecipientId = expandedRecipientId === id ? null : id;
  }

  function updateRecipient(id: string, field: keyof Omit<Recipient, 'contacts'>, value: string): void {
    recipients = recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    );
  }

  function addContact(recipientId: string): void {
    recipients = recipients.map(r => 
      r.id === recipientId 
        ? { ...r, contacts: [...r.contacts, createEmptyContact()] }
        : r
    );
  }

  function removeContact(recipientId: string, contactId: string): void {
    recipients = recipients.map(r => {
      if (r.id === recipientId) {
        return { ...r, contacts: r.contacts.filter(c => c.id !== contactId) };
      }
      return r;
    });
  }

  function updateContact(recipientId: string, contactId: string, field: keyof ContactInfo, value: string): void {
    recipients = recipients.map(r => {
      if (r.id === recipientId) {
        return {
          ...r,
          contacts: r.contacts.map(c => 
            c.id === contactId ? { ...c, [field]: value } : c
          ),
        };
      }
      return r;
    });
  }

  function handleContinue(): void {
    if (hasAtLeast2) {
      onContinue(recipients);
    }
  }

  function handleBack(): void {
    onBack(recipients);
  }

  // Drag and drop handlers
  function handleDragStart(e: DragEvent, recipientId: string): void {
    if (!e.dataTransfer) return;
    draggedRecipientId = recipientId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', recipientId);
  }

  function handleDragEnd(): void {
    draggedRecipientId = null;
    activeDropZone = null;
  }

  function handleDropZoneDragOver(e: DragEvent, insertIndex: number): void {
    e.preventDefault();
    if (!e.dataTransfer || !draggedRecipientId) return;
    e.dataTransfer.dropEffect = 'move';
    activeDropZone = insertIndex;
  }

  function handleDropZoneDragLeave(): void {
    activeDropZone = null;
  }

  function handleDropZoneDrop(e: DragEvent, insertIndex: number): void {
    e.preventDefault();
    if (!draggedRecipientId) {
      handleDragEnd();
      return;
    }

    const draggedIndex = recipients.findIndex(r => r.id === draggedRecipientId);
    if (draggedIndex === -1) {
      handleDragEnd();
      return;
    }

    // Don't move if dropping in same position or adjacent position
    if (insertIndex === draggedIndex || insertIndex === draggedIndex + 1) {
      handleDragEnd();
      return;
    }

    // Remove the dragged item
    const newRecipients = [...recipients];
    const [draggedItem] = newRecipients.splice(draggedIndex, 1);
    
    // Adjust insert index if we removed an item before the insert point
    const adjustedIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
    
    // Insert at new position
    newRecipients.splice(adjustedIndex, 0, draggedItem);
    recipients = newRecipients;
    
    handleDragEnd();
  }

  // Check if a drop zone should be hidden (adjacent to dragged item)
  function isDropZoneHidden(zoneIndex: number): boolean {
    if (!draggedRecipientId) return true;
    const draggedIndex = recipients.findIndex(r => r.id === draggedRecipientId);
    // Hide zones immediately before or after the dragged item
    return zoneIndex === draggedIndex || zoneIndex === draggedIndex + 1;
  }

  // Auto-save to JSON on any change (debounced)
  $effect(() => {
    updateStoredDataDebounced({
      recipients: recipients,
    });
  });


  // Contact type options
  const contactTypeOptions = $derived([
    { value: 'phone', label: t.whoEditor.contactTypes.phone },
    { value: 'email', label: t.whoEditor.contactTypes.email },
    { value: 'address', label: t.whoEditor.contactTypes.address },
    { value: 'x', label: t.whoEditor.contactTypes.x },
    { value: 'bluesky', label: t.whoEditor.contactTypes.bluesky },
    { value: 'mastodon', label: t.whoEditor.contactTypes.mastodon },
    { value: 'facebook', label: t.whoEditor.contactTypes.facebook },
    { value: 'telegram', label: t.whoEditor.contactTypes.telegram },
    { value: 'whatsapp', label: t.whoEditor.contactTypes.whatsapp },
    { value: 'signal', label: t.whoEditor.contactTypes.signal },
    { value: 'instagram', label: t.whoEditor.contactTypes.instagram },
    { value: 'snapchat', label: t.whoEditor.contactTypes.snapchat },
    { value: 'linkedin', label: t.whoEditor.contactTypes.linkedin },
    { value: 'web', label: t.whoEditor.contactTypes.web },
    { value: 'other', label: t.whoEditor.contactTypes.other },
  ]);
</script>

<EditorLayout
  title={t.whoEditor.title}
  {sidePanelOpen}
  collapseLabel={t.whoEditor.sidePanel.collapse}
  expandLabel={t.whoEditor.sidePanel.expand}
  wideSidePanel
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  <div class="recipients-list" role="list" bind:this={recipientsListElement}>
    {#each recipients as recipient, index (recipient.id)}
      <!-- Drop zone before this card -->
      <div 
        class="drop-zone"
        class:active={activeDropZone === index}
        class:hidden={isDropZoneHidden(index)}
        role="presentation"
        ondragover={(e) => handleDropZoneDragOver(e, index)}
        ondragleave={handleDropZoneDragLeave}
        ondrop={(e) => handleDropZoneDrop(e, index)}
      >
        <div class="drop-zone-indicator"></div>
      </div>
      
      <div 
        class="recipient-card" 
        class:expanded={expandedRecipientId === recipient.id}
        class:dragging={draggedRecipientId === recipient.id}
        data-recipient-id={recipient.id}
        role="listitem"
        draggable="true"
        ondragstart={(e) => handleDragStart(e, recipient.id)}
        ondragend={handleDragEnd}
      >
        <div 
          class="recipient-header" 
          role="button"
          tabindex="0"
          onclick={() => toggleExpanded(recipient.id)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(recipient.id); } }}
        >
          <div 
            class="drag-handle"
            role="button"
            tabindex="-1"
            aria-label="Réordonner"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
          >
            <Icon name="grip-vertical" size={18} />
          </div>
          <div class="recipient-summary">
            <span class="recipient-name">
              {recipient.name || t.whoEditor.newRecipient}
            </span>
          </div>
          <div class="recipient-actions">
            <button 
              class="remove-btn" 
              onclick={(e) => { e.stopPropagation(); removeRecipient(recipient.id); }}
              title={t.whoEditor.removeRecipient}
            >
              <Icon name="minus" size={16} />
            </button>
            <span class="expand-icon" class:rotated={expandedRecipientId === recipient.id}>
              <Icon name="chevron-right" size={20} />
            </span>
          </div>
        </div>
        
        {#if expandedRecipientId === recipient.id}
          <div class="recipient-details">
            <div class="form-field name-field">
              <label for="name-{recipient.id}">{t.whoEditor.fields.name}</label>
              <input
                id="name-{recipient.id}"
                type="text"
                value={recipient.name}
                oninput={(e) => updateRecipient(recipient.id, 'name', e.currentTarget.value)}
                placeholder={t.whoEditor.placeholders.name}
              />
            </div>
            
            <div class="contacts-section">
              <span class="contacts-label">{t.whoEditor.fields.contacts}</span>
              
              {#each recipient.contacts as contact (contact.id)}
                <div class="contact-row">
                  <select
                    class="contact-type"
                    value={contact.type}
                    onchange={(e) => updateContact(recipient.id, contact.id, 'type', e.currentTarget.value)}
                  >
                    {#each contactTypeOptions as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                  <input
                    class="contact-value"
                    type="text"
                    value={contact.value}
                    oninput={(e) => updateContact(recipient.id, contact.id, 'value', e.currentTarget.value)}
                    placeholder={t.whoEditor.placeholders.contactValue}
                  />
                  <input
                    class="contact-comment"
                    type="text"
                    value={contact.comment}
                    oninput={(e) => updateContact(recipient.id, contact.id, 'comment', e.currentTarget.value)}
                    placeholder={t.whoEditor.placeholders.contactComment}
                  />
                  <button 
                    class="remove-contact-btn"
                    onclick={() => removeContact(recipient.id, contact.id)}
                    title={t.whoEditor.removeContact}
                  >
                    <Icon name="minus" size={14} />
                  </button>
                </div>
              {/each}
              
              <button 
                class="add-contact-btn"
                onclick={() => addContact(recipient.id)}
              >
                <Icon name="plus" size={16} />
                {t.whoEditor.addContact}
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/each}
    
    <!-- Drop zone at the end of the list -->
    <div 
      class="drop-zone"
      class:active={activeDropZone === recipients.length}
      class:hidden={isDropZoneHidden(recipients.length)}
      role="presentation"
      ondragover={(e) => handleDropZoneDragOver(e, recipients.length)}
      ondragleave={handleDropZoneDragLeave}
      ondrop={(e) => handleDropZoneDrop(e, recipients.length)}
    >
      <div class="drop-zone-indicator"></div>
    </div>
    
    <button class="add-recipient-btn" onclick={addRecipient}>
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
      <span class="count-number">{totalRecipientCount}</span>
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
      <CheckboxItem
        checked={hasAtLeast3}
        label={t.whoEditor.sidePanel.checklist.atLeast3}
        readonly
      />
      <CheckboxItem
        checked={allNamed}
        label={t.whoEditor.sidePanel.checklist.allNamed}
        readonly
      />
      <CheckboxItem
        checked={allHaveContact}
        label={t.whoEditor.sidePanel.checklist.allHaveContact}
        readonly
      />
    </EssentialSection>

    <div class="optional-section">
      <CheckboxItem
        checked={hasAtLeast5}
        label={t.whoEditor.sidePanel.checklist.atLeast5}
        readonly
      />
      <CheckboxItem
        checked={allHaveAddress}
        label={t.whoEditor.sidePanel.checklist.allHaveAddress}
        readonly
      />
      <CheckboxItem
        checked={allHaveEmail}
        label={t.whoEditor.sidePanel.checklist.allHaveEmail}
        readonly
      />
      <CheckboxItem
        checked={allHavePhone}
        label={t.whoEditor.sidePanel.checklist.allHavePhone}
        readonly
      />
    </div>

    <TipSection text={t.whoEditor.sidePanel.tip} />
    <TipSection text={t.whoEditor.sidePanel.tip2} />
  {/snippet}
</EditorLayout>

<style>
  .recipients-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding: 0.5rem 0;
  }

  .recipient-card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
    cursor: grab;
  }

  .recipient-card:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }

  .recipient-card.expanded {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  /* Drag and drop styles */
  .recipient-card.dragging {
    opacity: 0.4;
    cursor: grabbing;
    transform: scale(0.98);
  }

  .drop-zone {
    height: 1rem;
    margin: -0.5rem 0;
    position: relative;
    z-index: 1;
    pointer-events: none;
  }

  .drop-zone:not(.hidden) {
    pointer-events: auto;
  }

  .drop-zone-indicator {
    height: 3px;
    border-radius: 2px;
    background: transparent;
    transition: background 0.15s ease;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
  }

  .drop-zone.active .drop-zone-indicator {
    background: #60a5fa;
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
  }

  .recipient-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    cursor: pointer;
    user-select: none;
  }

  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-right: 0.75rem;
    color: #64748b;
    cursor: grab;
    flex-shrink: 0;
    transition: color 0.2s ease;
  }

  .drag-handle:hover {
    color: #94a3b8;
  }

  .recipient-card.dragging .drag-handle {
    cursor: grabbing;
  }

  .recipient-summary {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .recipient-name {
    color: #e2e8f0;
    font-weight: 500;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recipient-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .expand-icon {
    color: #a0aec0;
    transition: transform 0.2s ease;
    display: flex;
  }

  .expand-icon.rotated {
    transform: rotate(90deg);
  }

  .recipient-details {
    padding: 0 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-field label {
    color: #a0aec0;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .form-field input {
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .form-field input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .form-field input:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  /* Contact section styles */
  .contacts-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contacts-label {
    color: #a0aec0;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .contact-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .contact-type {
    width: 140px;
    flex-shrink: 0;
    padding: 0.6rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .contact-type:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .contact-type option {
    background: #1a1a2e;
    color: #e2e8f0;
  }

  .contact-value {
    flex: 1;
    min-width: 0;
    padding: 0.6rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.9rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .contact-value::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .contact-value:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .contact-comment {
    width: 120px;
    flex-shrink: 0;
    padding: 0.6rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.85rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .contact-comment::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .contact-comment:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .remove-contact-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .remove-contact-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .add-contact-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 0.75rem;
    width: fit-content;
    background: rgba(96, 165, 250, 0.1);
    border: 1px dashed rgba(96, 165, 250, 0.4);
    border-radius: 6px;
    color: #60a5fa;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.25rem;
  }

  .add-contact-btn:hover {
    background: rgba(96, 165, 250, 0.15);
    border-color: rgba(96, 165, 250, 0.6);
  }

  .add-recipient-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(96, 165, 250, 0.1);
    border: 2px dashed rgba(96, 165, 250, 0.4);
    border-radius: 12px;
    color: #60a5fa;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-recipient-btn:hover {
    background: rgba(96, 165, 250, 0.15);
    border-color: rgba(96, 165, 250, 0.6);
  }

  /* Side panel styles */
  .recipient-count {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 12px;
    margin: 1rem 0;
  }

  .count-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #60a5fa;
  }

  .count-details {
    display: flex;
    flex-direction: column;
  }

  .count-label {
    color: #a0aec0;
    font-size: 0.95rem;
  }

  .count-warnings {
    color: #f59e0b;
    font-size: 0.8rem;
  }

  .optional-section {
    margin-bottom: 1rem;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .recipient-summary {
      flex-wrap: wrap;
    }

    .contact-row {
      flex-wrap: wrap;
    }

    .contact-type {
      width: 100%;
    }

    .contact-value {
      flex: 1;
      min-width: calc(100% - 36px);
    }

    .contact-comment {
      width: calc(100% - 36px);
    }

    .remove-contact-btn {
      position: absolute;
      right: 0;
      top: 0;
    }

    .contact-row {
      position: relative;
      padding-right: 36px;
    }
  }
</style>
