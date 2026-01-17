<script lang="ts">
  import type { Recipient, ContactInfo } from '../../lib/types/recipient';
  import ContactRow from './ContactRow.svelte';
  import Icon from './Icons.svelte';

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
      contactComment: string;
    };
  }

  interface Props {
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
    onUpdateContact: (contactId: string, field: keyof ContactInfo, value: string) => void;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: () => void;
    autoFocus?: boolean;
    toggleDisabled?: boolean;
  }

  let {
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
  }: Props = $props();

  let nameInput: HTMLInputElement | null = $state(null);

  $effect(() => {
    if (autoFocus && expanded && nameInput) {
      // Petit délai pour s'assurer que le DOM est rendu
      setTimeout(() => {
        nameInput?.focus();
      }, 100);
    }
  });

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
</script>

<div
  class="recipient-card"
  class:expanded
  class:dragging
  role="listitem"
  draggable="true"
  ondragstart={onDragStart}
  ondragend={onDragEnd}
>
  <div
    class="recipient-header"
    class:toggle-disabled={toggleDisabled}
    role="button"
    tabindex={toggleDisabled ? -1 : 0}
    onclick={handleToggle}
    onkeydown={handleKeydown}
  >
    <div
      class="drag-handle"
      role="presentation"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <Icon name="grip-vertical" size={18} />
    </div>
    <div class="recipient-summary">
      {#if expanded}
        <div class="name-input-wrapper">
          <input
            bind:this={nameInput}
            id="name-{recipient.id}"
            type="text"
            class="form-input recipient-name-input"
            value={recipient.name}
            oninput={(e) => onUpdateField('name', e.currentTarget.value)}
            placeholder={t.placeholders.name}
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
          />
          {#if recipient.isPrivate}
            <div class="private-info-message">
              {t.fields.privateInfo}
            </div>
          {:else if recipient.number}
            <div class="private-info-message">
              {t.fields.numberedInfo}
            </div>
          {/if}
        </div>
      {:else}
        <span class="recipient-name" class:private={recipient.isPrivate ?? false}>
          {recipient.name || t.newRecipient}
          {#if recipient.number !== undefined}
            <span class="recipient-number"> (#{recipient.number})</span>
          {/if}
        </span>
      {/if}
    </div>
    <div class="recipient-actions">
      {#if expanded}
        <button
          class="private-toggle-button"
          onclick={handlePrivateToggle}
          title={t.fields.notListedPublicly}
        >
          <Icon name={recipient.isPrivate ? 'eye-off' : 'eye'} size={18} />
        </button>
      {/if}
      {#if expanded && !recipient.number}
        <button
          class="remove-button large"
          onclick={handleRemoveClick}
          title={t.removeRecipient}
        >
          <Icon name="minus" size={16} />
        </button>
      {/if}
      <span class="expand-icon" class:rotated={expanded}>
        <Icon name="chevron-right" size={20} />
      </span>
    </div>
  </div>

  {#if expanded}
    <div class="recipient-details">
      <div class="contacts-section">
        {#each recipient.contacts as contact (contact.id)}
          <ContactRow
            {contact}
            {contactTypeOptions}
            placeholders={{ value: t.placeholders.contactValue, comment: t.placeholders.contactComment }}
            removeTitle={t.removeContact}
            onTypeChange={(type) => onUpdateContact(contact.id, 'type', type)}
            onValueChange={(value) => onUpdateContact(contact.id, 'value', value)}
            onCommentChange={(comment) => onUpdateContact(contact.id, 'comment', comment)}
            onRemove={() => onRemoveContact(contact.id)}
          />
        {/each}

        <button class="add-button" onclick={onAddContact}>
          <Icon name="plus" size={16} />
          {t.addContact}
        </button>
      </div>
    </div>
  {/if}
</div>
