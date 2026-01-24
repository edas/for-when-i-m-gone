
<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../../lib/i18n';
  import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
  import { 
    getStoredData, 
    decryptExportableData, 
    replaceWithDecryptedData
  } from '../../lib/dataStore';
  import EditorLayout from '../ui/EditorLayout.svelte';

  interface Props {
    lang: Language;
    onUnlocked: () => void;
    onBack: () => void;
  }

  let { lang, onUnlocked, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));
  let sidePanelOpen: boolean = $state(untrack(() => getInitialSidePanelState('unlock', true)));

  let password: string = $state('');
  let isUnlocking: boolean = $state(false);
  let error: string | null = $state(null);

  function toggleSidePanel(): void {
    sidePanelOpen = !sidePanelOpen;
    saveSidePanelState('unlock', sidePanelOpen);
  }

  async function handleUnlock(): Promise<void> {
    if (!password.trim() || isUnlocking) return;

    isUnlocking = true;
    error = null;

    try {
      const storedData = getStoredData();
      if (storedData.mode !== 'locked') {
        throw new Error('Data is not in locked format');
      }

      // At this point we know storedData is LockedStoredData
      const lockedData = storedData as import('../../lib/dataStore').LockedStoredData;
      const decryptedData = await decryptExportableData(lockedData, password);
      replaceWithDecryptedData(decryptedData);
      onUnlocked();
    } catch (e) {
      error = t.unlockEditor.error;
      console.error('Unlock failed:', e);
    } finally {
      isUnlocking = false;
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && password.trim() && !isUnlocking) {
      handleUnlock();
    }
  }
</script>

<EditorLayout
  title={t.unlockEditor.title}
  subtitle={t.unlockEditor.subtitle}
  {sidePanelOpen}
  collapseLabel={t.unlockEditor.sidePanel.collapse}
  expandLabel={t.unlockEditor.sidePanel.expand}
  onToggleSidePanel={toggleSidePanel}
  editorId="unlock"
>
  {#snippet children()}
    <div class="unlock-container">
      <div class="password-field">
        <input
          type="password"
          class="password-input"
          placeholder={t.unlockEditor.placeholder}
          bind:value={password}
          onkeydown={handleKeydown}
          disabled={isUnlocking}
        />
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="action-buttons">
        <button
          class="back-btn"
          onclick={onBack}
          disabled={isUnlocking}
        >
          {t.common.back}
        </button>
        <button
          class="unlock-btn"
          onclick={handleUnlock}
          disabled={!password.trim() || isUnlocking}
        >
          {#if isUnlocking}
            {t.unlockEditor.unlocking}
          {:else}
            {t.unlockEditor.buttons.unlock}
          {/if}
        </button>
      </div>
    </div>
  {/snippet}

  {#snippet sidePanelContent()}
    <h3>{t.unlockEditor.sidePanel.title}</h3>
    <p class="intro-text">{t.unlockEditor.sidePanel.intro}</p>
  {/snippet}
</EditorLayout>

<style>
  .unlock-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .password-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .password-input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    color: #e2e8f0;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .password-input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
  }

  .password-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .password-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: #f87171;
    font-size: 0.9rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    color: #a0aec0;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .back-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .unlock-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .unlock-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    transform: translateY(-1px);
  }

  .unlock-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  h3 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.25rem;
    color: #ffffff;
    margin-bottom: 1rem;
  }

  .intro-text {
    color: #a0aec0;
    font-size: 0.9rem;
    line-height: 1.6;
  }
</style>
