<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { getInitialSidePanelState, saveSidePanelState } from '../lib/sidePanelState';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';

  interface Props {
    lang: Language;
    onBack: () => void;
  }

  let { lang, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));
  let sidePanelOpen: boolean = $state(untrack(() => getInitialSidePanelState('decrypt', true)));

  // Placeholder states for decryption
  let isProcessing: boolean = $state(false);
  let decryptedSecret: string | null = $state(null);
  let errorMessage: string | null = $state(null);

  function toggleSidePanel(): void {
    sidePanelOpen = !sidePanelOpen;
    saveSidePanelState('decrypt', sidePanelOpen);
  }
</script>

<EditorLayout
  title={t.decryptEditor.title}
  subtitle={t.decryptEditor.subtitle}
  {sidePanelOpen}
  collapseLabel={t.decryptEditor.sidePanel.collapse}
  expandLabel={t.decryptEditor.sidePanel.expand}
  onToggleSidePanel={toggleSidePanel}
  editorId="decrypt"
>
  {#snippet children()}
    <div class="decrypt-container">
      {#if isProcessing}
        <div class="status-box processing">
          <div class="spinner"></div>
          <p>{t.decryptEditor.processing}</p>
        </div>
      {:else if errorMessage}
        <div class="status-box error">
          <p class="error-title">{t.decryptEditor.error}</p>
          <p class="error-message">{errorMessage}</p>
        </div>
      {:else if decryptedSecret}
        <div class="status-box success">
          <p class="success-title">{t.decryptEditor.success}</p>
        </div>
        <div class="secret-display">
          <pre>{decryptedSecret}</pre>
        </div>
      {:else}
        <div class="status-box waiting">
          <p>{t.decryptEditor.subtitle}</p>
        </div>
      {/if}
    </div>

    <ActionButtons
      {onBack}
      onContinue={() => {}}
      backLabel={t.decryptEditor.buttons.back}
      continueLabel=""
      showContinue={false}
    />
  {/snippet}

  {#snippet sidePanelContent()}
    <h3>{t.decryptEditor.sidePanel.title}</h3>
    <p class="intro-text">{t.decryptEditor.sidePanel.intro}</p>
  {/snippet}
</EditorLayout>

<style>
  .decrypt-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .status-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
  }

  .status-box.processing {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .status-box.success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-box.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .status-box.waiting {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status-box p {
    color: #a0aec0;
    margin: 0;
  }

  .success-title {
    color: #10b981 !important;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .error-title {
    color: #f87171 !important;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem !important;
  }

  .error-message {
    color: #fca5a5 !important;
    font-size: 0.9rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .secret-display {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    overflow-x: auto;
  }

  .secret-display pre {
    margin: 0;
    color: #e2e8f0;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
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
