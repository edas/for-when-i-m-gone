<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import { type ButtonState } from '../lib/buttonState';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import TipSection from './ui/TipSection.svelte';
  import Icon from './ui/Icons.svelte';

  export interface HowData {
    threshold: number;
    conditions: string;
    hasNoOpenConditions: boolean;
  }

  interface Props {
    lang: Language;
    recipientCount: number;
    initialData?: Partial<HowData>;
    onContinue: (data: HowData) => void;
    onBack: (data: HowData) => void;
  }

  let { lang, recipientCount, initialData, onContinue, onBack }: Props = $props();

  // Calculate default threshold based on recipient count
  function getDefaultThreshold(count: number): number {
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  // Use string to capture all user input including invalid values
  let inputValue: string = $state(untrack(() => 
    initialData?.threshold !== undefined 
      ? String(initialData.threshold) 
      : String(getDefaultThreshold(recipientCount))
  ));
  let conditions: string = $state(untrack(() => initialData?.conditions ?? ''));
  let hasNoOpenConditions: boolean = $state(untrack(() => initialData?.hasNoOpenConditions ?? false));
  let sidePanelOpen: boolean = $state(true);

  let t = $derived(getTranslations(lang));

  // Parse and validate the threshold input
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
  
  // Essential conditions
  let isValidThreshold = $derived(threshold !== null && threshold >= 2);
  let isTooHigh = $derived(threshold !== null && threshold > recipientCount);
  let isLowerThanRecipientCount = $derived(threshold !== null && threshold < recipientCount);
  let hasConditions = $derived(conditions.trim().length > 0);
  let allEssentialsChecked = $derived(isValidThreshold && isLowerThanRecipientCount && hasConditions);

  // Non-essential conditions (for display in side panel)
  let isAtLeast3 = $derived(threshold !== null && threshold >= 3);
  let isAtMost5 = $derived(threshold !== null && threshold <= 5);

  // Visual feedback for input styling
  // Red: invalid number, or threshold < 2, or threshold > recipient count
  let isError = $derived(
    !isValidNumber ||
    (threshold !== null && (threshold < 2 || threshold > recipientCount))
  );
  // Green: threshold between 3-5 AND strictly less than recipient count
  let isGreen = $derived(
    threshold !== null &&
    threshold >= 3 &&
    threshold <= 5 &&
    threshold < recipientCount
  );

  // Button is disabled if threshold < 2 or threshold > recipient count
  let canContinue = $derived(isValidThreshold && !isTooHigh);

  // Button state
  let buttonState = $derived.by((): ButtonState => {
    if (!canContinue) return 'none';
    if (allEssentialsChecked) return 'complete';
    return 'partial';
  });

  let buttonText = $derived(
    canContinue
      ? (allEssentialsChecked ? t.howEditor.buttons.continue : t.howEditor.buttons.continueWithoutEssentials)
      : t.howEditor.buttons.continue
  );

  function getCurrentData(): HowData {
    return {
      threshold: threshold ?? getDefaultThreshold(recipientCount),
      conditions,
      hasNoOpenConditions,
    };
  }

  function handleContinue(): void {
    if (canContinue) {
      onContinue(getCurrentData());
    }
  }

  function handleBack(): void {
    onBack(getCurrentData());
  }

  function increment(): void {
    const current = threshold ?? 1;
    if (current < recipientCount) {
      inputValue = String(current + 1);
    }
  }

  function decrement(): void {
    const current = threshold ?? 3;
    if (current > 2) {
      inputValue = String(current - 1);
    }
  }

  function handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    inputValue = target.value;
  }

  // Auto-uncheck hasNoOpenConditions when conditions become empty
  $effect(() => {
    if (!hasConditions && hasNoOpenConditions) {
      hasNoOpenConditions = false;
    }
  });

  // Auto-save to JSON on any change (debounced)
  $effect(() => {
    updateStoredDataDebounced({
      howData: getCurrentData(),
    });
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
      
      <div class="input-section">
        <div class="number-input-wrapper">
          <button 
            class="number-button decrement" 
            onclick={decrement}
            disabled={threshold === null || threshold <= 2}
            aria-label="Decrease"
          >
            <Icon name="minus" size={24} />
          </button>
          <input
            id="threshold-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="number-input"
            class:error={isError}
            class:optimal={isGreen}
            value={inputValue}
            oninput={handleInputChange}
          />
          <button 
            class="number-button increment" 
            onclick={increment}
            disabled={threshold !== null && threshold >= recipientCount}
            aria-label="Increase"
          >
            <Icon name="plus" size={24} />
          </button>
        </div>
        <span class="recipient-info">
          {t.howEditor.threshold.outOf.replace('{count}', String(recipientCount))}
        </span>
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
      <div class="condition-group">
        <label for="conditions" class="condition-label">
          <Icon name="info" size={20} />
          {t.howEditor.conditions.title}
        </label>
        <textarea
          id="conditions"
          class="condition-textarea"
          placeholder={t.howEditor.conditions.placeholder}
          bind:value={conditions}
        ></textarea>
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

<style>
  .how-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding: 2rem 1.5rem;
    overflow-y: auto;
  }

  /* Section styles */
  .threshold-section,
  .conditions-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  .section-subtitle {
    color: #a0aec0;
    margin: 0;
    font-size: 0.95rem;
  }

  /* Threshold input styles */
  .input-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .number-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .number-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .number-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .number-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .number-input {
    width: 80px;
    height: 60px;
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: #ffffff;
    outline: none;
    transition: all 0.3s ease;
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .number-input::-webkit-outer-spin-button,
  .number-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .number-input:focus {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .number-input.error {
    border-color: rgba(239, 68, 68, 0.7);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  .number-input.optimal {
    border-color: rgba(139, 92, 246, 0.7);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .recipient-info {
    color: #a0aec0;
    font-size: 0.9rem;
  }

  .error-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    max-width: 450px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 10px;
    color: #fca5a5;
    align-self: center;
  }

  .error-message p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  /* Conditions styles */
  .conditions-section {
    flex: 1;
    gap: 1.5rem;
    min-height: 0;
  }

  .condition-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 0;
  }

  .condition-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #e2e8f0;
    font-size: 1rem;
    font-weight: 500;
  }

  .condition-label :global(svg) {
    flex-shrink: 0;
    color: #60a5fa;
  }

  .condition-textarea {
    flex: 1;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #e2e8f0;
    font-size: 0.95rem;
    line-height: 1.5;
    resize: none;
    min-height: 120px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-family: inherit;
  }

  .condition-textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .condition-textarea:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  /* Side panel styles */
  .optional-section {
    margin-top: 1rem;
  }

  @media (max-width: 600px) {
    .how-content {
      padding: 1.5rem 1rem;
      gap: 2rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .number-input {
      width: 70px;
      height: 50px;
      font-size: 1.75rem;
    }

    .number-button {
      width: 40px;
      height: 40px;
    }
  }
</style>
