<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { hasRecipientsBlock, hasConditionsBlock } from '../../lib/tiptap/extensions';
  import Icon, { type IconName } from './Icons.svelte';

  interface BaseLabels {
    bold: string;
    italic: string;
    underline: string;
    bulletList: string;
    numberedList: string;
  }

  interface FullLabels extends BaseLabels {
    heading: string;
    paragraph: string;
    insertRecipients: string;
    insertConditions: string;
    insertDateTime: string;
    insertQuorum: string;
  }

  interface Props {
    editor: Editor | null;
    labels: BaseLabels | FullLabels;
    /** Compact mode: smaller buttons, no format/insert groups (for conditions editor) */
    compact?: boolean;
    /** Counter that increments on editor updates, used to trigger reactivity */
    editorVersion?: number;
    /** Threshold value for quorum insertion */
    threshold?: number;
  }

  let { editor, labels, compact = false, editorVersion = 0, threshold }: Props = $props();

  // Type guard to check if labels has full properties
  function isFullLabels(l: BaseLabels | FullLabels): l is FullLabels {
    return 'heading' in l;
  }

  // Check if blocks already exist (reactive based on editorVersion)
  let recipientsBlockExists = $derived.by(() => {
    void editorVersion;
    return hasRecipientsBlock(editor);
  });

  let conditionsBlockExists = $derived.by(() => {
    void editorVersion;
    return hasConditionsBlock(editor);
  });

  // Editor commands
  function toggleHeading(): void {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  }

  function setParagraph(): void {
    editor?.chain().focus().setParagraph().run();
  }

  function toggleBold(): void {
    editor?.chain().focus().toggleBold().run();
  }

  function toggleItalic(): void {
    editor?.chain().focus().toggleItalic().run();
  }

  function toggleUnderline(): void {
    editor?.chain().focus().toggleUnderline().run();
  }

  function toggleBulletList(): void {
    editor?.chain().focus().toggleBulletList().run();
  }

  function toggleOrderedList(): void {
    editor?.chain().focus().toggleOrderedList().run();
  }

  function insertRecipientsBlock(): void {
    editor?.chain().focus().insertRecipientsBlock().run();
  }

  function insertConditionsBlock(): void {
    editor?.chain().focus().insertConditionsBlock().run();
  }

  function insertDateTimeInline(): void {
    editor?.chain().focus().insertDateTimeInline().run();
  }

  function insertQuorumInline(): void {
    editor?.chain().focus().insertQuorumInline().run();
  }

  interface ToolbarButton {
    icon: IconName;
    label: string;
    action: () => void;
    disabled?: boolean;
  }

  // Button groups (some are conditional based on compact mode and labels)
  let formatButtons: ToolbarButton[] | null = $derived(
    !compact && isFullLabels(labels)
      ? [
          { icon: 'heading', label: labels.heading, action: toggleHeading },
          { icon: 'paragraph', label: labels.paragraph, action: setParagraph },
        ]
      : null
  );

  let styleButtons: ToolbarButton[] = $derived([
    { icon: 'bold', label: labels.bold, action: toggleBold },
    { icon: 'italic', label: labels.italic, action: toggleItalic },
    { icon: 'underline', label: labels.underline, action: toggleUnderline },
  ]);

  let listButtons: ToolbarButton[] = $derived([
    { icon: 'list-bullet', label: labels.bulletList, action: toggleBulletList },
    { icon: 'list-numbered', label: labels.numberedList, action: toggleOrderedList },
  ]);

  let insertButtons: ToolbarButton[] | null = $derived(
    !compact && isFullLabels(labels)
      ? [
        { icon: 'calendar', label: labels.insertDateTime, action: insertDateTimeInline },
        { icon: 'quorum', label: labels.insertQuorum, action: insertQuorumInline },    
        { icon: 'lock', label: labels.insertConditions, action: insertConditionsBlock, disabled: conditionsBlockExists },
        { icon: 'users', label: labels.insertRecipients, action: insertRecipientsBlock, disabled: recipientsBlockExists },
        ]
      : null
  );
</script>

<div class="toolbar" class:compact>
  {#if formatButtons}
    <div class="toolbar-group">
      {#each formatButtons as btn}
        <button 
          class="toolbar-btn" 
          onclick={btn.action} 
          title={btn.label}
          disabled={!editor}
        >
          <Icon name={btn.icon} size={compact ? 18 : 18} />
        </button>
      {/each}
    </div>
    <div class="toolbar-divider"></div>
  {/if}
  
  <div class="toolbar-group">
    {#each styleButtons as btn}
      <button 
        class="toolbar-btn" 
        onclick={btn.action} 
        title={btn.label}
        disabled={!editor}
      >
        <Icon name={btn.icon} size={18} />
      </button>
    {/each}
  </div>
  <div class="toolbar-divider"></div>
  <div class="toolbar-group">
    {#each listButtons as btn}
      <button 
        class="toolbar-btn" 
        onclick={btn.action} 
        title={btn.label}
        disabled={!editor}
      >
        <Icon name={btn.icon} size={18} />
      </button>
    {/each}
  </div>
  
  {#if insertButtons}
    <div class="toolbar-divider"></div>
    <div class="toolbar-group insert-group">
      {#each insertButtons as btn}
        <button 
          class="toolbar-btn insert-btn" 
          class:already-inserted={btn.disabled}
          onclick={btn.action} 
          title={btn.label}
          disabled={!editor || btn.disabled}
        >
          <Icon name={btn.icon} size={18} />
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
  }

  .toolbar.compact {
    padding: 0.5rem 0.75rem;
    border-radius: 10px 10px 0 0;
  }

  .toolbar-group {
    display: flex;
    gap: 0.25rem;
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 0.5rem;
  }

  .toolbar.compact .toolbar-divider {
    height: 20px;
    margin: 0 0.25rem;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toolbar.compact .toolbar-btn {
    width: 32px;
    height: 32px;
  }

  .toolbar-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toolbar-btn:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .toolbar-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Insert buttons have distinct styling */
  .insert-btn {
    color: #93c5fd;
  }

  .insert-btn:hover:not(:disabled) {
    background: rgba(96, 165, 250, 0.15);
    color: #bfdbfe;
    border-color: rgba(96, 165, 250, 0.3);
  }

  /* Already inserted buttons show as "done" */
  .insert-btn.already-inserted {
    color: #93c5fd;
    background: rgba(96, 165, 250, 0.1);
    border-color: rgba(96, 165, 250, 0.2);
    opacity: 1;
  }

  @media (max-width: 600px) {
    .toolbar {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
