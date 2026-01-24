<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../../lib/i18n';
  import { getInitialSidePanelState, saveSidePanelState } from '../../lib/sidePanelState';
  import EditorLayout from '../ui/EditorLayout.svelte';
  import ActionButtons from '../ui/ActionButtons.svelte';

  interface Props {
    lang: Language;
    onContinue: () => void;
    onBack: () => void;
  }

  let { lang, onContinue, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));
  let sidePanelOpen: boolean = $state(untrack(() => getInitialSidePanelState('recovery', true)));

  // Placeholder state for token input
  let tokens: string[] = $state(['']);
  let canContinue = $derived(tokens.some(token => token.trim().length > 0));

  function toggleSidePanel(): void {
    sidePanelOpen = !sidePanelOpen;
    saveSidePanelState('recovery', sidePanelOpen);
  }

  function addToken(): void {
    tokens = [...tokens, ''];
  }

  function removeToken(index: number): void {
    tokens = tokens.filter((_, i) => i !== index);
  }

  function updateToken(index: number, value: string): void {
    tokens = tokens.map((t, i) => i === index ? value : t);
  }

  function handleContinue(): void {
    if (canContinue) {
      onContinue();
    }
  }
</script>

<EditorLayout
  title={t.recoveryEditor.title}
  subtitle={t.recoveryEditor.subtitle}
  {sidePanelOpen}
  collapseLabel={t.recoveryEditor.sidePanel.collapse}
  expandLabel={t.recoveryEditor.sidePanel.expand}
  onToggleSidePanel={toggleSidePanel}
  editorId="recovery"
>
  {#snippet children()}
    <div class="tokens-container">
      {#each tokens as token, index}
        <div class="token-row">
          <span class="token-number">{index + 1}</span>
          <textarea
            class="token-input"
            placeholder={t.recoveryEditor.placeholder}
            value={token}
            oninput={(e) => updateToken(index, (e.target as HTMLTextAreaElement).value)}
            rows="3"
          ></textarea>
          {#if tokens.length > 1}
            <button
              class="remove-token-btn"
              onclick={() => removeToken(index)}
              aria-label="Remove token"
            >
              &times;
            </button>
          {/if}
        </div>
      {/each}
      
      <button class="add-token-btn" onclick={addToken}>
        + Ajouter un jeton
      </button>
    </div>

    <ActionButtons
      {onBack}
      onContinue={handleContinue}
      backLabel={t.common.back}
      continueLabel={t.recoveryEditor.buttons.continue}
      disabled={!canContinue}
    />
  {/snippet}

  {#snippet sidePanelContent()}
    <h3>{t.recoveryEditor.sidePanel.title}</h3>
    <p class="intro-text">{t.recoveryEditor.sidePanel.intro}</p>
  {/snippet}
</EditorLayout>

<style>
  .tokens-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .token-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .token-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    color: #60a5fa;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
    margin-top: 0.5rem;
  }

  .token-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: #e2e8f0;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.875rem;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.2s ease;
  }

  .token-input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
  }

  .token-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .remove-token-btn {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #f87171;
    width: 32px;
    height: 32px;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-top: 0.5rem;
  }

  .remove-token-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .add-token-btn {
    background: rgba(59, 130, 246, 0.1);
    border: 1px dashed rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: #60a5fa;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-token-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
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
