<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import { getTranslations, type Language } from '../lib/i18n';
  import { updateStoredData } from '../lib/dataStore';
  import { computeButtonStateCustom, getButtonText, type ButtonState } from '../lib/buttonState';
  import { type HowData } from '../lib/types/editorTypes';
  import { parseHtmlToJson } from '../lib/htmlParser';
  import { createTiptapEditor } from '../lib/tiptap/createEditor';
  import { hasJsonContent } from '../lib/tiptap/utils';
  import { generateExampleInEditor } from '../lib/tiptap/editorHelpers';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
import TipSection from './ui/TipSection.svelte';
import RichTextToolbar from './ui/RichTextToolbar.svelte';
import Icon from './ui/Icons.svelte';
  import '../styles/tiptap-editor.css';
  import '../styles/how-editor.css';

  interface Props {
    lang: Language;
    recipientCount: number;
    initialData?: Partial<HowData>;
    aesKey?: Uint8Array;
    onContinue: (data: HowData) => void;
    onBack: (data: HowData) => void;
  }

  let { lang, recipientCount, initialData, aesKey, onContinue, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));

  function getDefaultThreshold(count: number): number {
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  function getDefaultConditions(): JSONContent {
    return parseHtmlToJson(t.howEditor.sidePanel.exampleContent);
  }

  let inputValue: string = $state(untrack(() => 
    initialData?.threshold !== undefined 
      ? String(initialData.threshold) 
      : String(getDefaultThreshold(recipientCount))
  ));
  let conditionsJson: JSONContent | null = $state(untrack(() => 
    initialData?.conditions ?? null
  ));
  
  const initialIsUnmodified = untrack(() => initialData?.isConditionsUnmodified ?? !initialData?.conditions);
  let isConditionsUnmodified: boolean = $state(initialIsUnmodified);
  let hasNoOpenConditions: boolean = $state(
    untrack(() => initialIsUnmodified ? true : (initialData?.hasNoOpenConditions ?? false))
  );
  let programmaticUpdateInProgress = false;
  let sidePanelOpen: boolean = $state(true);

  let editorElement: HTMLDivElement | null = $state(null);
  let editor: Editor | null = $state(null);

  // Parse threshold input
  let parsedValue = $derived(() => {
    const trimmed = inputValue.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    if (isNaN(num) || !isFinite(num) || !Number.isInteger(num)) return null;
    return num;
  });

  let threshold = $derived(parsedValue());
  let isValidNumber = $derived(threshold !== null);
  let isOne = $derived(threshold === 1);
  let isValidThreshold = $derived(threshold !== null && threshold >= 2);
  let isTooHigh = $derived(threshold !== null && threshold > recipientCount);
  let isLowerThanRecipientCount = $derived(threshold !== null && threshold < recipientCount);

  let hasConditions = $derived(hasJsonContent(conditionsJson));

  let allEssentialsChecked = $derived(
    isValidThreshold && 
    (recipientCount <= 2 || isLowerThanRecipientCount) && 
    hasConditions
  );

  let isAtLeast3 = $derived(threshold !== null && threshold >= 3);
  let isAtMost5 = $derived(threshold !== null && threshold <= 5);

  let isError = $derived(
    !isValidNumber || (threshold !== null && (threshold < 2 || threshold > recipientCount))
  );
  let isGreen = $derived(
    threshold !== null && threshold >= 3 && threshold <= 5 && threshold < recipientCount
  );

  let canContinue = $derived(isValidThreshold && !isTooHigh);

  // Check if AES key is already generated
  let isAesKeyGenerated = $derived(aesKey instanceof Uint8Array);

  let buttonState = $derived(computeButtonStateCustom(canContinue, allEssentialsChecked));
  let buttonText = $derived(
    getButtonText(buttonState, {
      continueWithoutEssentials: t.howEditor.buttons.continueWithoutEssentials,
      continue: t.howEditor.buttons.continue,
    })
  );

  function getCurrentData(): HowData {
    return {
      threshold: threshold ?? getDefaultThreshold(recipientCount),
      conditions: conditionsJson,
      hasNoOpenConditions,
      isConditionsUnmodified,
    };
  }

  function handleContinue(): void {
    if (canContinue) onContinue(getCurrentData());
  }

  function handleBack(): void {
    onBack(getCurrentData());
  }

  function increment(): void {
    const current = threshold ?? 1;
    if (current < recipientCount) inputValue = String(current + 1);
  }

  function decrement(): void {
    const current = threshold ?? 3;
    if (current > 2) inputValue = String(current - 1);
  }

  function handleInputChange(event: Event): void {
    inputValue = (event.target as HTMLInputElement).value;
  }

  function generateExample(): void {
    if (!editor) return;
    const exampleContent = getDefaultConditions();

    programmaticUpdateInProgress = true;

    generateExampleInEditor(editor, exampleContent, hasConditions);
    
    if (!hasConditions) {
      isConditionsUnmodified = true;
      hasNoOpenConditions = true;
    }
    
    conditionsJson = editor.getJSON();
    requestAnimationFrame(() => { programmaticUpdateInProgress = false; });
  }

  // Auto-uncheck when conditions become empty
  $effect(() => {
    if (!hasConditions && hasNoOpenConditions) hasNoOpenConditions = false;
  });

  // Initialize TipTap editor
  $effect(() => {
    if (editorElement && !editor) {
      editor = createTiptapEditor({
        element: editorElement,
        content: conditionsJson,
        placeholder: t.howEditor.conditions.placeholder,
        contentClass: 'tiptap-content',
        enableHeadings: false,
        onUpdate: (json) => {
          conditionsJson = json;
          if (programmaticUpdateInProgress) return;
          if (isConditionsUnmodified) {
            isConditionsUnmodified = false;
            hasNoOpenConditions = false;
          }
        },
      });
    }
  });

  onDestroy(() => editor?.destroy());

  // Auto-save
  $effect(() => {
    updateStoredData((currentData) => ({
      ...currentData,
      how: getCurrentData()
    }));
  });
</script>

<EditorLayout
  title={t.howEditor.title}
  {sidePanelOpen}
  collapseLabel={t.howEditor.sidePanel.collapse}
  expandLabel={t.howEditor.sidePanel.expand}
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  <div class="how-content">
    <!-- Threshold Section -->
    <section class="threshold-section">
      <h2 class="section-title">{t.howEditor.threshold.title}</h2>
      <p class="section-subtitle">{t.howEditor.threshold.subtitle}</p>
      
      <div class="threshold-content">
        <div class="input-section">
          <div class="number-input-wrapper">
            <button 
              class="number-button" 
              onclick={decrement}
              disabled={isAesKeyGenerated || threshold === null || threshold <= 2}
              aria-label="Decrease"
            >
              <Icon name="minus" size={24} />
            </button>
            <input
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              class="number-input"
              class:error={isError}
              class:optimal={isGreen}
              value={inputValue}
              oninput={handleInputChange}
              readonly={isAesKeyGenerated}
            />
            <button 
              class="number-button" 
              onclick={increment}
              disabled={isAesKeyGenerated || (threshold !== null && threshold >= recipientCount)}
              aria-label="Increase"
            >
              <Icon name="plus" size={24} />
            </button>
          </div>
          <span class="recipient-info">
            {t.howEditor.threshold.outOf.replace('{count}', String(recipientCount))}
          </span>
        </div>

        <div class="quorum-warning-inline">
          <div class="warning-icon">
            <Icon name="alert-triangle" size={20} />
          </div>
          <p class="warning-text">{t.howEditor.sidePanel.quorumWarning}</p>
        </div>
      </div>

      {#if isOne}
        <div class="error-message">
          <Icon name="alert-triangle" size={20} />
          <p>{t.howEditor.threshold.errorOne}</p>
        </div>
      {/if}
    </section>

    <!-- Conditions Section -->
    <section class="conditions-section">
      <label class="condition-label">
        <Icon name="info" size={20} />
        {t.howEditor.conditions.title}
      </label>
      
      <div class="editor-wrapper">
        <RichTextToolbar {editor} labels={t.howEditor.toolbar} compact />
        <div class="tiptap-editor compact" bind:this={editorElement}></div>
      </div>
    </section>
  </div>

  <ActionButtons
    backLabel={t.common.back}
    continueLabel={buttonText}
    {buttonState}
    disabled={!canContinue}
    onBack={handleBack}
    onContinue={handleContinue}
    alternativeLabel={t.howEditor.sidePanel.generateExample}
    showAlternative={!hasConditions}
    onAlternative={generateExample}
  />

  {#snippet sidePanelContent()}
    <h2>{t.howEditor.sidePanel.title}</h2>

    <EssentialSection note={t.howEditor.sidePanel.essentialNote}>
      <CheckboxItem
        checked={isValidThreshold && !isTooHigh}
        label={t.howEditor.sidePanel.checklist.validThreshold}
        readonly
      />
      <CheckboxItem
        checked={isLowerThanRecipientCount}
        label={t.howEditor.sidePanel.checklist.lowerThanRecipientCount}
        description={t.howEditor.sidePanel.checklist.lowerThanRecipientCountHelp}
        strikethrough={recipientCount <= 2}
        readonly
      />
      <CheckboxItem
        checked={hasConditions}
        label={t.howEditor.sidePanel.checklist.hasConditions}
        readonly
      />
    </EssentialSection>

    <div class="optional-section">
      <CheckboxItem
        checked={isAtLeast3}
        label={t.howEditor.sidePanel.checklist.atLeast3}
        description={t.howEditor.sidePanel.checklist.atLeast3Help}
        strikethrough={recipientCount <= 2}
        readonly
      />
      <CheckboxItem
        checked={isAtMost5}
        label={t.howEditor.sidePanel.checklist.atMost5}
        description={t.howEditor.sidePanel.checklist.atMost5Help}
        readonly
      />
      <CheckboxItem
        bind:checked={hasNoOpenConditions}
        label={t.howEditor.sidePanel.checklist.hasNoOpenConditions}
        readonly={!hasConditions}
      />
    </div>

    <TipSection text={t.howEditor.sidePanel.tip} />
  {/snippet}
</EditorLayout>
