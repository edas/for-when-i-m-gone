<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { recordSecurityConfirmation } from '../lib/dataStore';
  import LanguageSelector from './ui/LanguageSelector.svelte';
  import Icon from './ui/Icons.svelte';

  interface Props {
    lang: Language;
    initialChecked?: boolean;
    onContinue: (checked: boolean) => void;
    onLanguageChange: (lang: Language) => void;
  }

  let { lang, initialChecked, onContinue, onLanguageChange }: Props = $props();

  let isChecked: boolean = $state(untrack(() => initialChecked ?? false));

  let t = $derived(getTranslations(lang));

  function handleCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    isChecked = checked;
    
    // Record timestamp each time the checkbox is checked
    if (checked) {
      recordSecurityConfirmation();
    }
  }

  function handleContinue(): void {
    if (isChecked) {
      onContinue(isChecked);
    }
  }
</script>

<div class="overlay">
  <LanguageSelector {lang} {onLanguageChange} />

  <div class="warning-container">
    <div class="warning-icon">
      <Icon name="warning" size={80} />
    </div>

    <h1>{t.securityWarning.title}</h1>
    <p class="subtitle">{t.securityWarning.subtitle}</p>

    <div class="checkbox-container">
      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={isChecked}
          onchange={handleCheckboxChange}
        />
        <span class="checkmark"></span>
        <span class="label-text">
          {t.securityWarning.checkboxLabel}<a
            href="https://github.com/edas/for-when-i-m-gone"
            target="_blank"
            rel="noopener noreferrer"
          >{t.securityWarning.checkboxLabelLink}</a>{t.securityWarning.checkboxLabelEnd}
        </span>
      </label>
    </div>

    <button
      class="continue-button"
      disabled={!isChecked}
      onclick={handleContinue}
    >
      {t.securityWarning.continueButton}
    </button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .warning-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 3rem;
    max-width: 560px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .warning-icon {
    margin: 0 auto 1.5rem;
    color: #f59e0b;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  h1 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: #a0aec0;
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .checkbox-container {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
    text-align: left;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    cursor: pointer;
    position: relative;
  }

  .checkbox-label input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    transition: all 0.2s ease;
    position: relative;
  }

  .checkbox-label:hover .checkmark {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }

  .checkbox-label input:checked ~ .checkmark {
    background: #10b981;
    border-color: #10b981;
  }

  .checkmark::after {
    content: '';
    position: absolute;
    display: none;
    left: 7px;
    top: 3px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-label input:checked ~ .checkmark::after {
    display: block;
  }

  .label-text {
    color: #e2e8f0;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .label-text a {
    color: #60a5fa;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .label-text a:hover {
    color: #93c5fd;
    text-decoration: underline;
  }

  .continue-button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .continue-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .continue-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .continue-button:disabled {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.6;
  }
</style>
