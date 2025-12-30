<script lang="ts">
  import Icon from './Icons.svelte';

  interface ToolbarAction {
    icon: 'heading' | 'paragraph' | 'bold' | 'italic' | 'underline' | 'list-bullet' | 'list-numbered';
    title: string;
    command: string;
    isFormatBlock?: boolean;
  }

  interface Props {
    editorElement: HTMLElement | null;
    labels: {
      heading: string;
      paragraph: string;
      bold: string;
      italic: string;
      underline: string;
      bulletList: string;
      numberedList: string;
    };
  }

  let { editorElement, labels }: Props = $props();

  function execCommand(command: string): void {
    document.execCommand(command, false);
    editorElement?.focus();
  }

  function formatBlock(tag: string): void {
    document.execCommand('formatBlock', false, tag);
    editorElement?.focus();
  }

  const formatActions: ToolbarAction[] = [
    { icon: 'heading', title: 'heading', command: 'h2', isFormatBlock: true },
    { icon: 'paragraph', title: 'paragraph', command: 'p', isFormatBlock: true },
  ];

  const styleActions: ToolbarAction[] = [
    { icon: 'bold', title: 'bold', command: 'bold' },
    { icon: 'italic', title: 'italic', command: 'italic' },
    { icon: 'underline', title: 'underline', command: 'underline' },
  ];

  const listActions: ToolbarAction[] = [
    { icon: 'list-bullet', title: 'bulletList', command: 'insertUnorderedList' },
    { icon: 'list-numbered', title: 'numberedList', command: 'insertOrderedList' },
  ];

  function handleAction(action: ToolbarAction): void {
    if (action.isFormatBlock) {
      formatBlock(action.command);
    } else {
      execCommand(action.command);
    }
  }

  function getLabel(key: string): string {
    return labels[key as keyof typeof labels] ?? key;
  }
</script>

<div class="toolbar">
  <div class="toolbar-group">
    {#each formatActions as action}
      <button 
        class="toolbar-btn" 
        onclick={() => handleAction(action)} 
        title={getLabel(action.title)}
      >
        <Icon name={action.icon} size={18} />
      </button>
    {/each}
  </div>
  <div class="toolbar-divider"></div>
  <div class="toolbar-group">
    {#each styleActions as action}
      <button 
        class="toolbar-btn" 
        onclick={() => handleAction(action)} 
        title={getLabel(action.title)}
      >
        <Icon name={action.icon} size={18} />
      </button>
    {/each}
  </div>
  <div class="toolbar-divider"></div>
  <div class="toolbar-group">
    {#each listActions as action}
      <button 
        class="toolbar-btn" 
        onclick={() => handleAction(action)} 
        title={getLabel(action.title)}
      >
        <Icon name={action.icon} size={18} />
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

  .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toolbar-btn:active {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 600px) {
    .toolbar {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
