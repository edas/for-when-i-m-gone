<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';
  import Icon from './ui/Icons.svelte';

  export interface IntroCheckboxState {
    secretHolders: boolean;
    openCases: boolean;
    noOpenCases: boolean;
    directives: boolean;
  }

  export const defaultIntroCheckboxState: IntroCheckboxState = {
    secretHolders: false,
    openCases: false,
    noOpenCases: false,
    directives: false,
  };

  interface Props {
    lang: Language;
    initialValue?: string;
    initialCheckboxState?: IntroCheckboxState;
    onContinue: (message: string, checkboxState: IntroCheckboxState) => void;
    onBack: (message: string, checkboxState: IntroCheckboxState) => void;
  }

  let { lang, initialValue, initialCheckboxState, onContinue, onBack }: Props = $props();

  let messageHtml: string = $state(untrack(() => initialValue ?? ''));
  let sidePanelOpen: boolean = $state(true);
  let editorElement: HTMLDivElement | null = $state(null);

  // Checkbox states for verification
  let checkSecretHolders: boolean = $state(untrack(() => initialCheckboxState?.secretHolders ?? false));
  let checkOpenCases: boolean = $state(untrack(() => initialCheckboxState?.openCases ?? false));
  let checkNoOpenCases: boolean = $state(untrack(() => initialCheckboxState?.noOpenCases ?? false));
  let checkDirectives: boolean = $state(untrack(() => initialCheckboxState?.directives ?? false));

  let t = $derived(getTranslations(lang));

  let hasContent = $derived(messageHtml.trim().length > 0);
  let allChecked = $derived(checkSecretHolders && checkOpenCases && checkNoOpenCases && checkDirectives);
  let anyChecked = $derived(checkSecretHolders || checkOpenCases || checkNoOpenCases || checkDirectives);

  type ButtonState = 'none' | 'partial' | 'complete';

  let buttonState = $derived.by((): ButtonState => {
    if (!hasContent || !anyChecked) return 'none';
    if (!allChecked) return 'partial';
    return 'complete';
  });

  let buttonText = $derived.by(() => {
    switch (buttonState) {
      case 'none': return t.introEditor.buttons.continueWithoutConfirm;
      case 'partial': return t.introEditor.buttons.continueWithoutEssentials;
      case 'complete': return t.introEditor.buttons.continue;
    }
  });

  function getCurrentCheckboxState(): IntroCheckboxState {
    return {
      secretHolders: checkSecretHolders,
      openCases: checkOpenCases,
      noOpenCases: checkNoOpenCases,
      directives: checkDirectives,
    };
  }

  function handleContinue(): void {
    if (hasContent && editorElement) {
      onContinue(editorElement.innerHTML, getCurrentCheckboxState());
    }
  }

  function handleBack(): void {
    onBack(editorElement?.innerHTML ?? '', getCurrentCheckboxState());
  }

  function handleInput(): void {
    if (editorElement) {
      messageHtml = editorElement.innerHTML;
    }
  }

  function execCommand(command: string, value: string | undefined = undefined): void {
    document.execCommand(command, false, value);
    editorElement?.focus();
  }

  function formatBlock(tag: string): void {
    document.execCommand('formatBlock', false, tag);
    editorElement?.focus();
  }

  // Initialize editor content with initial value when mounted
  $effect(() => {
    if (editorElement && initialValue && !editorElement.innerHTML) {
      editorElement.innerHTML = initialValue;
    }
  });

  function generateExample(): void {
    if (editorElement) {
      const example = t.introEditor.sidePanel.exampleContent;
      const currentContent = editorElement.innerHTML.trim();
      if (currentContent) {
        editorElement.innerHTML = currentContent + '<br><br>' + example;
      } else {
        editorElement.innerHTML = example;
      }
      messageHtml = editorElement.innerHTML;
      editorElement.focus();
    }
  }
</script>

<EditorLayout
  title={t.introEditor.title}
  subtitle={t.introEditor.subtitle}
  {sidePanelOpen}
  collapseLabel={t.introEditor.sidePanel.collapse}
  expandLabel={t.introEditor.sidePanel.expand}
  wideSidePanel
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  {#snippet toolbar()}
    <div class="toolbar">
      <div class="toolbar-group">
        <button class="toolbar-btn" onclick={() => formatBlock('h2')} title={t.introEditor.toolbar.heading}>
          <Icon name="heading" size={18} />
        </button>
        <button class="toolbar-btn" onclick={() => formatBlock('p')} title={t.introEditor.toolbar.paragraph}>
          <Icon name="paragraph" size={18} />
        </button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" onclick={() => execCommand('bold')} title={t.introEditor.toolbar.bold}>
          <Icon name="bold" size={18} />
        </button>
        <button class="toolbar-btn" onclick={() => execCommand('italic')} title={t.introEditor.toolbar.italic}>
          <Icon name="italic" size={18} />
        </button>
        <button class="toolbar-btn" onclick={() => execCommand('underline')} title={t.introEditor.toolbar.underline}>
          <Icon name="underline" size={18} />
        </button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" onclick={() => execCommand('insertUnorderedList')} title={t.introEditor.toolbar.bulletList}>
          <Icon name="list-bullet" size={18} />
        </button>
        <button class="toolbar-btn" onclick={() => execCommand('insertOrderedList')} title={t.introEditor.toolbar.numberedList}>
          <Icon name="list-numbered" size={18} />
        </button>
      </div>
    </div>
  {/snippet}

  <div
    class="rich-editor"
    contenteditable="true"
    bind:this={editorElement}
    oninput={handleInput}
    role="textbox"
    aria-multiline="true"
    data-placeholder={t.introEditor.placeholder}
  ></div>

  <ActionButtons
    backLabel={t.common.back}
    continueLabel={buttonText}
    {buttonState}
    disabled={!hasContent}
    onBack={handleBack}
    onContinue={handleContinue}
  />

  {#snippet sidePanelContent()}
    <h2>{t.introEditor.sidePanel.title}</h2>
    <p class="panel-intro">{t.introEditor.sidePanel.intro}</p>

    <EssentialSection note={t.introEditor.sidePanel.essentialNote}>
      <CheckboxItem
        bind:checked={checkSecretHolders}
        label={t.introEditor.sidePanel.checkboxes.secretHolders.title}
        description={t.introEditor.sidePanel.checkboxes.secretHolders.description}
        essential
      />
      <CheckboxItem
        bind:checked={checkOpenCases}
        label={t.introEditor.sidePanel.checkboxes.openCases.title}
        description={t.introEditor.sidePanel.checkboxes.openCases.description}
        essential
      />
      <CheckboxItem
        bind:checked={checkNoOpenCases}
        label={t.introEditor.sidePanel.checkboxes.noOpenCases.title}
        description={t.introEditor.sidePanel.checkboxes.noOpenCases.description}
        essential
      />
    </EssentialSection>

    <div class="optional-section">
      <CheckboxItem
        bind:checked={checkDirectives}
        label={t.introEditor.sidePanel.checkboxes.directives.title}
        description={t.introEditor.sidePanel.checkboxes.directives.description}
      />
    </div>

    <div class="tip-section">
      <div class="tip-icon">
        <Icon name="info" size={20} />
      </div>
      <p class="tip-text">{t.introEditor.sidePanel.tip}</p>
    </div>

    <div class="section-divider"></div>

    <GenerateExampleButton
      label={t.introEditor.sidePanel.generateExample}
      onclick={generateExample}
    />
  {/snippet}
</EditorLayout>

<style>
  /* Toolbar */
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

  /* Rich Editor */
  .rich-editor {
    flex: 1;
    min-height: 350px;
    padding: 1.5rem;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.05rem;
    line-height: 1.7;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0 0 12px 12px;
    color: #e2e8f0;
    overflow-y: auto;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .rich-editor:empty::before {
    content: attr(data-placeholder);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  .rich-editor:focus {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .rich-editor :global(h2) {
    font-size: 1.4rem;
    font-weight: 600;
    color: #ffffff;
    margin: 1rem 0 0.75rem 0;
  }

  .rich-editor :global(h2:first-child) {
    margin-top: 0;
  }

  .rich-editor :global(p) {
    margin-bottom: 0.75rem;
  }

  .rich-editor :global(ul), .rich-editor :global(ol) {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .rich-editor :global(li) {
    margin-bottom: 0.35rem;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .rich-editor {
      min-height: 200px;
    }

    .toolbar {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
