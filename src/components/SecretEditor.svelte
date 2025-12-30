<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';

  interface Props {
    lang: Language;
    initialValue?: string;
    onContinue: (secret: string) => void;
    onBack: (secret: string) => void;
  }

  let { lang, initialValue, onContinue, onBack }: Props = $props();

  let secretText: string = $state(untrack(() => initialValue ?? ''));
  let sidePanelOpen: boolean = $state(true);

  // Checkbox states - first 3 are essential
  let checkEmails: boolean = $state(false);
  let checkPhoneCodes: boolean = $state(false);
  let checkCloudAccounts: boolean = $state(false);
  let checkComputerLogins: boolean = $state(false);
  let checkOtherPasswords: boolean = $state(false);
  let checkDomainManager: boolean = $state(false);
  let checkPasswordManager: boolean = $state(false);
  let checkBackups: boolean = $state(false);
  let checkCrypto: boolean = $state(false);

  let t = $derived(getTranslations(lang));

  let hasContent = $derived(secretText.trim().length > 0);

  let essentialsChecked = $derived(checkEmails && checkPhoneCodes && checkCloudAccounts);

  let anyChecked = $derived(
    checkEmails || checkPhoneCodes || checkCloudAccounts ||
    checkComputerLogins || checkOtherPasswords ||
    checkDomainManager || checkPasswordManager || checkBackups || checkCrypto
  );

  type ButtonState = 'none' | 'partial' | 'complete';

  let buttonState = $derived.by((): ButtonState => {
    if (!anyChecked) return 'none';
    if (!essentialsChecked) return 'partial';
    return 'complete';
  });

  let buttonText = $derived.by(() => {
    switch (buttonState) {
      case 'none': return t.secretEditor.buttons.continueWithoutConfirm;
      case 'partial': return t.secretEditor.buttons.continueWithoutEssentials;
      case 'complete': return t.secretEditor.buttons.continue;
    }
  });

  function handleContinue(): void {
    if (hasContent) {
      onContinue(secretText);
    }
  }

  function toggleSidePanel(): void {
    sidePanelOpen = !sidePanelOpen;
  }

  function generateExample(): void {
    const example = t.secretEditor.sidePanel.exampleContent;
    if (secretText.trim()) {
      secretText = secretText + '\n\n\n' + example;
    } else {
      secretText = example;
    }
  }
</script>

<div class="editor-container">
  <main class="main-content" class:panel-closed={!sidePanelOpen}>
    <div class="editor-wrapper">
      <h1>{t.secretEditor.title}</h1>
      <textarea
        class="secret-textarea"
        bind:value={secretText}
        placeholder={t.secretEditor.placeholder}
      ></textarea>
      <div class="button-container">
        <button class="back-button" onclick={() => onBack(secretText)}>
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.common.back}
        </button>
        <button
          class="continue-button"
          class:state-none={buttonState === 'none'}
          class:state-partial={buttonState === 'partial'}
          class:state-complete={buttonState === 'complete'}
          disabled={!hasContent}
          onclick={handleContinue}
        >
          {#if buttonState === 'none'}
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          {:else if buttonState === 'partial'}
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          {:else}
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          {/if}
          {buttonText}
        </button>
      </div>
    </div>
  </main>

  <aside class="side-panel" class:closed={!sidePanelOpen}>
    <button class="toggle-button" onclick={toggleSidePanel}>
      {#if sidePanelOpen}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <span class="toggle-text">{t.secretEditor.sidePanel.collapse}</span>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span class="toggle-text">{t.secretEditor.sidePanel.expand}</span>
      {/if}
    </button>

    {#if sidePanelOpen}
      <div class="panel-content">
        <h2>{t.secretEditor.sidePanel.title}</h2>

        <div class="essential-section">
          <div class="essential-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.83L19.13 19H4.87L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>

          <label class="checkbox-item essential">
            <input type="checkbox" bind:checked={checkEmails} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.emails}</span>
          </label>

          <label class="checkbox-item essential">
            <input type="checkbox" bind:checked={checkPhoneCodes} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.phoneCodes}</span>
          </label>

          <label class="checkbox-item essential">
            <input type="checkbox" bind:checked={checkCloudAccounts} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.cloudAccounts}</span>
          </label>

          <p class="essential-note">{t.secretEditor.sidePanel.essentialNote}</p>
        </div>

        <div class="regular-section">
          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkComputerLogins} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.computerLogins}</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkOtherPasswords} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.otherPasswords}</span>
          </label>
        </div>

        <div class="optional-section">
          <h3>{t.secretEditor.sidePanel.sectionOptional}</h3>

          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkDomainManager} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.domainManager}</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkPasswordManager} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.passwordManager}</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkBackups} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.backups}</span>
          </label>

          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkCrypto} />
            <span class="custom-checkbox"></span>
            <span class="label-text">{t.secretEditor.sidePanel.checkboxes.crypto}</span>
          </label>
        </div>

        <div class="section-divider"></div>

        <button class="generate-example-button" onclick={generateExample}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {t.secretEditor.sidePanel.generateExample}
        </button>
      </div>
    {/if}
  </aside>
</div>

<style>
  .editor-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    transition: margin-right 0.3s ease;
  }

  .main-content.panel-closed {
    margin-right: 0;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
  }

  h1 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .secret-textarea {
    flex: 1;
    min-height: 400px;
    padding: 1.5rem;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #e2e8f0;
    resize: vertical;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .secret-textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .secret-textarea:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: #e2e8f0;
  }

  .back-button .button-icon {
    width: 18px;
    height: 18px;
  }

  .continue-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
  }

  .button-icon {
    width: 22px;
    height: 22px;
  }

  .continue-button.state-none {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
  }

  .continue-button.state-partial {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }

  .continue-button.state-complete {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .continue-button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .continue-button.state-none:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
  }

  .continue-button.state-partial:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }

  .continue-button.state-complete:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .continue-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Side Panel */
  .side-panel {
    width: 380px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
  }

  .side-panel.closed {
    width: 60px;
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: #a0aec0;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 0.9rem;
    width: 100%;
    justify-content: flex-start;
  }

  .toggle-button:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #e2e8f0;
  }

  .toggle-button svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .toggle-text {
    white-space: nowrap;
  }

  .side-panel.closed .toggle-text {
    display: none;
  }

  .panel-content {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .panel-content h2 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.25rem;
    color: #ffffff;
    margin-bottom: 1.25rem;
  }

  .panel-content h3 {
    font-size: 0.85rem;
    font-weight: 600;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    padding-top: 0.5rem;
  }

  .essential-section {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
  }

  .essential-badge {
    position: absolute;
    top: -10px;
    right: 12px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .essential-badge svg {
    width: 16px;
    height: 16px;
  }

  .essential-note {
    font-size: 0.8rem;
    color: #fbbf24;
    line-height: 1.5;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(245, 158, 11, 0.2);
  }

  .regular-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .optional-section {
    opacity: 0.85;
  }

  .section-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
    margin: 2rem 0;
  }

  .generate-example-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
    font-weight: 500;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 10px;
    color: #c4b5fd;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .generate-example-button:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%);
    border-color: rgba(139, 92, 246, 0.6);
    color: #ddd6fe;
    transform: translateY(-1px);
  }

  .generate-example-button:active {
    transform: translateY(0);
  }

  .generate-example-button svg {
    width: 18px;
    height: 18px;
  }

  .checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem 0;
    cursor: pointer;
    position: relative;
  }

  .checkbox-item input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .custom-checkbox {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-radius: 5px;
    transition: all 0.2s ease;
    position: relative;
    margin-top: 2px;
  }

  .checkbox-item:hover .custom-checkbox {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
  }

  .checkbox-item input:checked ~ .custom-checkbox {
    background: #10b981;
    border-color: #10b981;
  }

  .checkbox-item.essential input:checked ~ .custom-checkbox {
    background: #f59e0b;
    border-color: #f59e0b;
  }

  .custom-checkbox::after {
    content: '';
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-item input:checked ~ .custom-checkbox::after {
    display: block;
  }

  .label-text {
    color: #e2e8f0;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .side-panel {
      position: fixed;
      right: 0;
      top: 0;
      height: 100vh;
      z-index: 100;
      box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
    }

    .side-panel.closed {
      width: 50px;
    }

    .main-content {
      margin-right: 50px;
    }

    .main-content.panel-closed {
      margin-right: 50px;
    }
  }

  @media (max-width: 600px) {
    .editor-container {
      flex-direction: column;
    }

    .main-content {
      margin-right: 0;
      padding: 1rem;
      padding-bottom: 70px;
    }

    .main-content.panel-closed {
      margin-right: 0;
    }

    .side-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      width: 100% !important;
      height: auto;
      max-height: 70vh;
      border-left: none;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .side-panel.closed {
      height: 50px;
      max-height: 50px;
    }

    .toggle-button {
      justify-content: center;
    }

    .toggle-button svg {
      transform: rotate(90deg);
    }

    .secret-textarea {
      min-height: 250px;
    }

    h1 {
      font-size: 1.5rem;
    }

    .button-container {
      flex-direction: column;
    }

    .back-button,
    .continue-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
