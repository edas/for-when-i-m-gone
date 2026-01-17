<script lang="ts">
  import { onMount } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { getStoredData, updateStoredData } from '../lib/dataStore';
  import { generateAES256Key, exportKeyToBase64, importKeyFromBase64, encryptBuffer, textToBuffer } from '../lib/crypto/aes';
  import { split } from 'ssss-js';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';

  interface Props {
    lang: Language;
    secret: string;
    recipients: import('../lib/types/recipient').Recipient[];
    threshold: number;
    onContinue: () => void;
    onBack: () => void;
  }

  let { lang, secret, recipients, threshold, onContinue, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));
  let sidePanelOpen: boolean = $state(true);
  let errorMessage: string | null = $state(null);
  
  // Check initial state synchronously
  function checkInitialState(): boolean {
    console.log('[GenerateEditor] Checking initial state...');
    const storedData = getStoredData();
    const generateData = storedData.generate;
    const numberOfRecipients = recipients?.length ?? 0;
    
    console.log('[GenerateEditor] Initial state:', {
      hasAesKey: !!generateData?.aesKey,
      hasEncryptedSecret: !!generateData?.encryptedSecret,
      hasIv: !!generateData?.iv,
      hasShares: !!generateData?.shares,
      sharesLength: generateData?.shares?.length,
      numberOfRecipients,
      recipientsFromProps: recipients.length,
    });
    
    if (
      generateData?.aesKey &&
      generateData?.encryptedSecret &&
      generateData?.iv &&
      generateData?.shares &&
      generateData.shares.length === numberOfRecipients &&
      numberOfRecipients > 0
    ) {
      console.log('[GenerateEditor] Already ready!');
      return true;
    }
    console.log('[GenerateEditor] Not ready, will process...');
    return false;
  }
  
  const initialStateReady = checkInitialState();
  let isReady: boolean = $state(initialStateReady);
  let isProcessing: boolean = $state(false);

  // Placeholder state - will be updated based on requirements
  let canContinue = $derived(isReady);
  let allEssentialsChecked = $derived(true);
  let anyChecked = $derived(true);

  let buttonState = $derived(computeButtonState(canContinue, anyChecked, allEssentialsChecked));
  let buttonText = $derived(getButtonText(buttonState, t.generateEditor.buttons));

  /**
   * Converts an ArrayBuffer to a base64 string
   */
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts a Uint8Array to a base64 string
   */
  function uint8ArrayToBase64(array: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < array.length; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts a base64 string to a hex string
   */
  function base64ToHex(base64: string): string {
    const binary = atob(base64);
    let hex = '';
    for (let i = 0; i < binary.length; i++) {
      const charCode = binary.charCodeAt(i);
      hex += charCode.toString(16).padStart(2, '0');
    }
    return hex;
  }

  /**
   * Main generation logic: creates AES key, encrypts secret, and splits the key
   */
  async function generate(): Promise<void> {
    if (isProcessing) {
      console.log('[GenerateEditor] Already processing, skipping...');
      return;
    }
    
    console.log('[GenerateEditor] Starting generation...');
    isProcessing = true;
    errorMessage = null;
    
    try {
      console.log('[GenerateEditor] Step 1: Validating input data...');
      console.log('[GenerateEditor] Secret from props:', !!secret, 'Type:', typeof secret, 'Length:', secret?.length);
      console.log('[GenerateEditor] Recipients from props:', recipients?.length ?? 0);
      console.log('[GenerateEditor] Threshold from props:', threshold);
      
      // Validate required data from props
      if (!secret || (typeof secret === 'string' && secret.trim().length === 0)) {
        const errorMsg = !secret 
          ? 'Secret content is missing (secret prop is undefined or null)'
          : 'Secret content is empty (secret prop is an empty string)';
        console.error('[GenerateEditor]', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!recipients || recipients.length === 0) {
        throw new Error('No recipients found (recipients prop is empty)');
      }
      
      if (!threshold || threshold <= 0) {
        throw new Error('Threshold is missing or invalid (threshold prop is missing or <= 0)');
      }
      
      // Get stored data for checking if already generated
      const storedData = getStoredData();
      
      const numberOfRecipients = recipients.length;
      const generateData = storedData.generate;
      console.log('[GenerateEditor] Generate data exists:', !!generateData);
      
      // Check if everything is already generated
      if (
        generateData?.aesKey &&
        generateData?.encryptedSecret &&
        generateData?.iv &&
        generateData?.shares &&
        generateData.shares.length === numberOfRecipients
      ) {
        // Everything is already ready
        console.log('[GenerateEditor] Everything already ready!');
        isReady = true;
        return;
      }
      
      // 1. Create or retrieve AES key
      console.log('[GenerateEditor] Step 2: Handling AES key...');
      let aesKeyBase64 = generateData?.aesKey;
      let key: CryptoKey;
      
      if (aesKeyBase64) {
        console.log('[GenerateEditor] Importing existing key...');
        // Import existing key
        key = await importKeyFromBase64(aesKeyBase64);
        console.log('[GenerateEditor] Key imported successfully');
      } else {
        console.log('[GenerateEditor] Generating new key...');
        // Generate new key
        key = await generateAES256Key();
        console.log('[GenerateEditor] Key generated, exporting...');
        aesKeyBase64 = await exportKeyToBase64(key);
        console.log('[GenerateEditor] Key exported, storing...');
        
        // Store the key
        await updateStoredData((currentData) => ({
          ...currentData,
          generate: {
            ...currentData.generate,
            aesKey: aesKeyBase64,
          },
        }));
        console.log('[GenerateEditor] Key stored');
      }
      
      // 2. Encrypt the secret (only if not already encrypted)
      if (!generateData?.encryptedSecret || !generateData?.iv) {
        console.log('[GenerateEditor] Step 3: Encrypting secret...');
        const secretBuffer = textToBuffer(secret);
        console.log('[GenerateEditor] Secret buffer created, encrypting...');
        const encryptedData = await encryptBuffer(key, secretBuffer);
        console.log('[GenerateEditor] Secret encrypted, converting to base64...');
        
        const encryptedSecretBase64 = arrayBufferToBase64(encryptedData.ciphertext);
        const ivBase64 = uint8ArrayToBase64(encryptedData.iv);
        console.log('[GenerateEditor] Converted to base64, storing...');
        
        // Store encrypted secret and IV
        await updateStoredData((currentData) => ({
          ...currentData,
          generate: {
            ...currentData.generate,
            encryptedSecret: encryptedSecretBase64,
            iv: ivBase64,
          },
        }));
        console.log('[GenerateEditor] Encrypted secret stored');
      } else {
        console.log('[GenerateEditor] Step 3: Secret already encrypted, skipping...');
      }
      
      // 3. Split the AES key using ssss-js (only if not already split)
      if (!generateData?.shares || generateData.shares.length !== numberOfRecipients) {
        console.log('[GenerateEditor] Step 4: Splitting key with ssss-js...');
        // Convert base64 key to hex for ssss-js
        const aesKeyHex = base64ToHex(aesKeyBase64);
        console.log('[GenerateEditor] Key converted to hex, length:', aesKeyHex.length);
        console.log('[GenerateEditor] Calling split with:', {
          threshold,
          numberOfKeys: numberOfRecipients,
          inputIsHex: true,
        });
        
        const shares = split(aesKeyHex, {
          threshold: threshold,
          numberOfKeys: numberOfRecipients,
          inputIsHex: true,
        });
        console.log('[GenerateEditor] Split completed, shares count:', shares.length);
        
        // Store the shares
        await updateStoredData((currentData) => ({
          ...currentData,
          generate: {
            ...currentData.generate,
            shares: shares,
          },
        }));
        console.log('[GenerateEditor] Shares stored');
      } else {
        console.log('[GenerateEditor] Step 4: Shares already exist, skipping...');
      }
      
      console.log('[GenerateEditor] Generation completed successfully!');
      isReady = true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[GenerateEditor] Error during generation:', error);
      console.error('[GenerateEditor] Error stack:', error instanceof Error ? error.stack : 'No stack');
      errorMessage = `Erreur: ${errorMsg}`;
      isReady = false;
    } finally {
      isProcessing = false;
      console.log('[GenerateEditor] Processing finished, isReady:', isReady);
    }
  }

  onMount(() => {
    if (!isReady) {
      console.log('[GenerateEditor] onMount: Not ready, starting generation...');
      generate();
    } else {
      console.log('[GenerateEditor] onMount: Already ready, skipping generation');
    }
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
      <p class="processing-text">Génération en cours...</p>
    {:else if isReady}
      <p class="ready-text">prêt</p>
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
</style>
