<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import Icon from './ui/Icons.svelte';

  interface Props {
    lang: Language;
    initialValue?: number;
    onContinue: (threshold: number) => void;
    onBack: (threshold: number) => void;
  }

  let { lang, initialValue, onContinue, onBack }: Props = $props();

  // Use string to capture all user input including invalid values
  let inputValue: string = $state(untrack(() => initialValue !== undefined ? String(initialValue) : ''));
  let sidePanelOpen: boolean = $state(true);

  let t = $derived(getTranslations(lang));

  // Parse and validate the input
  let parsedValue = $derived(() => {
    const trimmed = inputValue.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    // Check if it's a valid integer (not NaN, not Infinity, and is an integer)
    if (isNaN(num) || !isFinite(num) || !Number.isInteger(num)) return null;
    return num;
  });

  let threshold = $derived(parsedValue());
  let isValidNumber = $derived(threshold !== null);
  let isOne = $derived(threshold === 1);
  let isTooSmall = $derived(threshold === 2);
  let isOptimal = $derived(threshold === 3 || threshold === 4);
  let isTooLarge = $derived(threshold !== null && threshold >= 5);
  let isValid = $derived(threshold !== null && threshold >= 2);

  function handleContinue(): void {
    if (isValid && threshold !== null) {
      onContinue(threshold);
    }
  }

  function handleBack(): void {
    onBack(threshold ?? 3);
  }

  function increment(): void {
    const current = threshold ?? 1;
    inputValue = String(current + 1);
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

  // Auto-save to JSON on any change (debounced)
  $effect(() => {
    if (threshold !== null) {
      updateStoredDataDebounced({ threshold });
    }
  });
</script>

<EditorLayout
  {sidePanelOpen}
  collapseLabel={t.thresholdSelector.sidePanel.collapse}
  expandLabel={t.thresholdSelector.sidePanel.expand}
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  <div class="threshold-content">
    <div class="form-group">
      <h1 class="title">{t.thresholdSelector.title}</h1>
      <p class="subtitle">{t.thresholdSelector.subtitle}</p>
      
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
            class:error={!isValidNumber || isOne}
            class:warning-small={isTooSmall}
            class:optimal={isOptimal}
            class:warning-large={isTooLarge}
            value={inputValue}
            oninput={handleInputChange}
          />
          <button 
            class="number-button increment" 
            onclick={increment}
            aria-label="Increase"
          >
            <Icon name="plus" size={24} />
          </button>
        </div>
      </div>

      {#if isOne}
        <div class="error-message">
          <Icon name="alert-triangle" size={20} />
          <p>{t.thresholdSelector.errorOne}</p>
        </div>
      {/if}
    </div>
  </div>

  <ActionButtons
    backLabel={t.common.back}
    continueLabel={t.thresholdSelector.continueButton}
    buttonState={isValid ? 'complete' : 'none'}
    disabled={!isValid}
    onBack={handleBack}
    onContinue={handleContinue}
  />

  {#snippet sidePanelContent()}
    <h2>{t.thresholdSelector.sidePanel.title}</h2>

    <p class="panel-intro">{t.thresholdSelector.sidePanel.intro}</p>

    <div class="advice-section" class:highlighted={isTooSmall}>
      <h3>{t.thresholdSelector.sidePanel.warningTooSmall.title}</h3>
      <p class="advice-text">{t.thresholdSelector.sidePanel.warningTooSmall.text}</p>
    </div>

    <div class="advice-section" class:highlighted={isTooLarge}>
      <h3>{t.thresholdSelector.sidePanel.warningTooLarge.title}</h3>
      <p class="advice-text">{t.thresholdSelector.sidePanel.warningTooLarge.text}</p>
    </div>
  {/snippet}
</EditorLayout>

<style>
  .threshold-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    text-align: center;
  }

  .subtitle {
    color: #a0aec0;
    text-align: center;
    margin: 0;
    font-size: 1rem;
    max-width: 400px;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
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
    width: 50px;
    height: 50px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
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
    width: 100px;
    height: 70px;
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
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

  .number-input.warning-small {
    border-color: rgba(139, 92, 246, 0.7);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .number-input.optimal {
    border-color: rgba(16, 185, 129, 0.7);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  .number-input.warning-large {
    border-color: rgba(139, 92, 246, 0.7);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .error-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    max-width: 450px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    color: #fca5a5;
  }

  .error-message p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* Side panel styles */
  .panel-intro {
    color: #a0aec0;
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0 0 0.5rem 0;
  }

  .advice-section {
    padding: 1rem;
    margin-top: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .advice-section.highlighted {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .advice-section h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #cbd5e1;
  }

  .advice-section.highlighted h3 {
    color: #a78bfa;
  }

  .advice-text {
    margin: 0;
    font-size: 0.85rem;
    color: #a0aec0;
    line-height: 1.6;
  }

  .advice-section.highlighted .advice-text {
    color: #ddd6fe;
  }

  @media (max-width: 600px) {
    .threshold-content {
      padding: 2rem 1rem;
    }

    .title {
      font-size: 1.5rem;
    }

    .number-input {
      width: 80px;
      height: 60px;
      font-size: 2rem;
    }

    .number-button {
      width: 44px;
      height: 44px;
    }
  }
</style>
