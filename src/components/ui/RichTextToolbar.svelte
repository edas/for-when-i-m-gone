<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import Icon from './Icons.svelte';

  type IconName = 'heading' | 'paragraph' | 'bold' | 'italic' | 'underline' | 'list-bullet' | 'list-numbered' | 'users' | 'lock';

  interface Props {
    editor: Editor | null;
    labels: {
      heading: string;
      paragraph: string;
      bold: string;
      italic: string;
      underline: string;
      bulletList: string;
      numberedList: string;
      insertRecipients: string;
      insertConditions: string;
    };
  }

  let { editor, labels }: Props = $props();

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

  interface ToolbarButton {
    icon: IconName;
    label: string;
    action: () => void;
  }

  let formatButtons: ToolbarButton[] = $derived([
    { icon: 'heading', label: labels.heading, action: toggleHeading },
    { icon: 'paragraph', label: labels.paragraph, action: setParagraph },
  ]);

  let styleButtons: ToolbarButton[] = $derived([
    { icon: 'bold', label: labels.bold, action: toggleBold },
    { icon: 'italic', label: labels.italic, action: toggleItalic },
    { icon: 'underline', label: labels.underline, action: toggleUnderline },
  ]);

  let listButtons: ToolbarButton[] = $derived([
    { icon: 'list-bullet', label: labels.bulletList, action: toggleBulletList },
    { icon: 'list-numbered', label: labels.numberedList, action: toggleOrderedList },
  ]);

  let insertButtons: ToolbarButton[] = $derived([
    { icon: 'users', label: labels.insertRecipients, action: insertRecipientsBlock },
    { icon: 'lock', label: labels.insertConditions, action: insertConditionsBlock },
  ]);
</script>

<div class="toolbar">
  <div class="toolbar-group">
    {#each formatButtons as btn}
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
  <div class="toolbar-divider"></div>
  <div class="toolbar-group insert-group">
    {#each insertButtons as btn}
      <button 
        class="toolbar-btn insert-btn" 
        onclick={btn.action} 
        title={btn.label}
        disabled={!editor}
      >
        <Icon name={btn.icon} size={18} />
      </button>
    {/each}
  </div>
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

  @media (max-width: 600px) {
    .toolbar {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
