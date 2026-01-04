<script lang="ts">
  import type { ContactInfo } from '../../lib/types/recipient';
  import Icon from './Icons.svelte';

  interface ContactTypeOption {
    value: string;
    label: string;
  }

  interface Props {
    contact: ContactInfo;
    contactTypeOptions: ContactTypeOption[];
    placeholders: { value: string; comment: string };
    removeTitle: string;
    onTypeChange: (type: string) => void;
    onValueChange: (value: string) => void;
    onCommentChange: (comment: string) => void;
    onRemove: () => void;
  }

  let {
    contact,
    contactTypeOptions,
    placeholders,
    removeTitle,
    onTypeChange,
    onValueChange,
    onCommentChange,
    onRemove,
  }: Props = $props();
</script>

<div class="contact-row">
  <select
    class="form-select contact-type"
    value={contact.type}
    onchange={(e) => onTypeChange(e.currentTarget.value)}
  >
    {#each contactTypeOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <input
    class="form-input contact-value"
    type="text"
    value={contact.value}
    oninput={(e) => onValueChange(e.currentTarget.value)}
    placeholder={placeholders.value}
  />
  <input
    class="form-input contact-comment"
    type="text"
    value={contact.comment}
    oninput={(e) => onCommentChange(e.currentTarget.value)}
    placeholder={placeholders.comment}
  />
  <button
    class="remove-button"
    onclick={onRemove}
    title={removeTitle}
  >
    <Icon name="minus" size={14} />
  </button>
</div>
