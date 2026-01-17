<script lang="ts">
  import { onMount } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { updateStoredData, getStoredData } from '../lib/dataStore';
  import { 
    generateAES256Key, 
    exportKeyToUint8Array,
    importKeyFromUint8Array,
    encryptBuffer, 
    textToBuffer,
  } from '../lib/crypto/aes';
  // @ts-expect-error - ssss-js types may not be fully defined, but splitBuffer exists and accepts Uint8Array
  import { splitBuffer } from 'ssss-js';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';

  interface Props {
    lang: Language;
    secret: string;
    recipients: import('../lib/types/recipient').Recipient[];
    threshold: number;
    aesKey?: Uint8Array;
    shares?: string[];
    onContinue: () => void;
    onBack: () => void;
  }

  let { lang, secret, recipients, threshold, aesKey, shares, onContinue, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));
  let sidePanelOpen: boolean = $state(true);
  let errorMessage: string | null = $state(null);
  let isReady: boolean = $state(false);
  let isProcessing: boolean = $state(false);
  let currentShares: string[] = $state([]);
  
  // Initialize currentShares from props when component mounts or shares change
  $effect(() => {
    if (shares && shares.length > 0) {
      currentShares = shares;
    }
  });

  let canContinue = $derived(isReady);
  let allEssentialsChecked = $derived(true);
  let anyChecked = $derived(true);

  let buttonState = $derived(computeButtonState(canContinue, anyChecked, allEssentialsChecked));
  let buttonText = $derived(getButtonText(buttonState, t.generateEditor.buttons));

  /**
   * Validates that all required input data is present
   */
  function validateInputs(): void {
    if (!secret?.trim()) {
      throw new Error('Secret content is missing or empty');
    }
    if (!recipients?.length) {
      throw new Error('No recipients found');
    }
    if (!threshold || threshold <= 0) {
      throw new Error('Threshold is missing or invalid');
    }
  }

  /**
   * Gets or creates the AES key (reuses existing key from props if available)
   */
  async function getOrCreateAesKey(): Promise<{ key: CryptoKey; keyBytes: Uint8Array }> {
    if (aesKey instanceof Uint8Array) {
      const key = await importKeyFromUint8Array(aesKey);
      return { key, keyBytes: aesKey };
    }
    
    const key = await generateAES256Key();
    const keyBytes = await exportKeyToUint8Array(key);
    
    await updateStoredData((data) => ({
      ...data,
      generate: { ...data.generate, aesKey: keyBytes },
    }));
    
    return { key, keyBytes };
  }

  /**
   * Encrypts the secret and stores the result (always re-encrypts)
   */
  async function encryptAndStoreSecret(key: CryptoKey): Promise<void> {
    const secretBuffer = textToBuffer(secret);
    const { ciphertext, iv } = await encryptBuffer(key, secretBuffer);
    
    await updateStoredData((data) => ({
      ...data,
      generate: {
        ...data.generate,
        encryptedSecret: ciphertext,
        iv: iv,
      },
    }));
  }

  /**
   * Splits the key into shares (always performs the split)
   */
  async function splitKey(keyBytes: Uint8Array): Promise<string[]> {
    const newShares = splitBuffer(keyBytes, {
      threshold,
      numberOfKeys: recipients.length,
    });
    
    await updateStoredData((data) => ({
      ...data,
      generate: { ...data.generate, shares: newShares },
    }));
    
    currentShares = newShares;
    return newShares;
  }

  /**
   * Main generation logic: creates AES key, encrypts secret, and splits the key
   */
  async function generate(): Promise<void> {
    if (isProcessing) return;
    
    isProcessing = true;
    errorMessage = null;
    
    try {
      validateInputs();
      
      const { key, keyBytes } = await getOrCreateAesKey();
      await encryptAndStoreSecret(key);
      await splitKey(keyBytes);
      
      isReady = true;
    } catch (error) {
      errorMessage = `Erreur: ${error instanceof Error ? error.message : String(error)}`;
      isReady = false;
    } finally {
      isProcessing = false;
    }
  }

  /**
   * Copies a share to clipboard
   */
  async function copyShareToClipboard(share: string, recipientName: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(share);
      // Optionnel: afficher un message de confirmation
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  onMount(() => {
    generate();
  });

  function handleContinue(): void {
    if (canContinue) onContinue();
  }

  function handleBack(): void {
    onBack();
  }
</script>

<EditorLayout
  title={t.generateEditor.title}
  {sidePanelOpen}
  collapseLabel={t.generateEditor.sidePanel.collapse}
  expandLabel={t.generateEditor.sidePanel.expand}
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  <div class="generate-content">
    {#if errorMessage}
      <p class="error-text">{errorMessage}</p>
    {:else if isProcessing}
      <p class="processing-text">{t.generateEditor.processing}</p>
    {:else if isReady}
      <div class="ready-section">
        <p class="ready-text">{t.generateEditor.ready}</p>
        {#if currentShares.length > 0 && currentShares.length === recipients.length}
          <div class="shares-section">
            <h3 class="shares-title">{t.generateEditor.shares.title}</h3>
            <p class="shares-intro">{t.generateEditor.shares.intro}</p>
            <div class="shares-list">
              {#each recipients as recipient, index (recipient.id)}
                <div class="share-item">
                  <div class="share-header">
                    <span class="share-recipient-name">{recipient.name || t.generateEditor.shares.unnamedRecipient}</span>
                    <button
                      class="copy-button"
                      onclick={() => copyShareToClipboard(currentShares[index], recipient.name)}
                      title={t.generateEditor.shares.copyButton}
                    >
                      {t.generateEditor.shares.copyButton}
                    </button>
                  </div>
                  <div class="share-value" title={currentShares[index]}>
                    {currentShares[index]}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <p class="placeholder-text">{t.generateEditor.placeholder}</p>
    {/if}
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
    <h2>{t.generateEditor.sidePanel.title}</h2>
    <p class="panel-intro">{t.generateEditor.sidePanel.intro}</p>
  {/snippet}
</EditorLayout>

<style>
  .generate-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    min-height: 300px;
  }

  .placeholder-text {
    color: #a0aec0;
    font-size: 1.1rem;
    text-align: center;
    margin: 2rem 0;
  }

  .processing-text {
    color: #4299e1;
    font-size: 1.1rem;
    text-align: center;
    margin: 2rem 0;
  }

  .ready-text {
    color: #48bb78;
    font-size: 1.1rem;
    text-align: center;
    margin: 2rem 0;
    font-weight: 600;
  }

  .error-text {
    color: #f56565;
    font-size: 1.1rem;
    text-align: center;
    margin: 2rem 0;
    font-weight: 600;
  }

  .ready-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .shares-section {
    margin-top: 1rem;
  }

  .shares-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .shares-intro {
    color: #4a5568;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .shares-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .share-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    background-color: #f7fafc;
  }

  .share-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .share-recipient-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 1rem;
  }

  .copy-button {
    padding: 0.4rem 0.8rem;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .copy-button:hover {
    background-color: #3182ce;
  }

  .copy-button:active {
    background-color: #2c5282;
  }

  .share-value {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #1a202c;
    background-color: white;
    padding: 0.75rem;
    border-radius: 4px;
    word-break: break-all;
    border: 1px solid #cbd5e0;
    line-height: 1.5;
  }
</style>
