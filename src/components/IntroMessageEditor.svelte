<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';
  import RichTextToolbar from './ui/RichTextToolbar.svelte';
  import TipSection from './ui/TipSection.svelte';

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
  let allEssentialsChecked = $derived(checkSecretHolders && checkOpenCases && checkNoOpenCases);
  let anyChecked = $derived(checkSecretHolders || checkOpenCases || checkNoOpenCases || checkDirectives);

  let buttonState = $derived(computeButtonState(hasContent, anyChecked, allEssentialsChecked));
  let buttonText = $derived(getButtonText(buttonState, t.introEditor.buttons));

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

  // Auto-save to JSON on any change (debounced)
  $effect(() => {
    const state = getCurrentCheckboxState();
    updateStoredDataDebounced({
      introMessage: messageHtml,
      introCheckboxState: state,
    });
  });
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
    <RichTextToolbar {editorElement} labels={t.introEditor.toolbar} />
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

    <TipSection text={t.introEditor.sidePanel.tip} />

    <div class="section-divider"></div>

    <GenerateExampleButton
      label={t.introEditor.sidePanel.generateExample}
      onclick={generateExample}
    />
  {/snippet}
</EditorLayout>

<style>
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

  @media (max-width: 600px) {
    .rich-editor {
      min-height: 200px;
    }
  }
</style>
