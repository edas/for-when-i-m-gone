<script lang="ts">
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import EditorLayout from './ui/EditorLayout.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';

  interface Props {
    lang: Language;
    onContinue: () => void;
    onBack: () => void;
  }

  let { lang, onContinue, onBack }: Props = $props();

  let t = $derived(getTranslations(lang));
  let sidePanelOpen: boolean = $state(true);

  // Placeholder state - will be updated based on requirements
  let canContinue = $derived(true);
  let allEssentialsChecked = $derived(true);
  let anyChecked = $derived(true);

  let buttonState = $derived(computeButtonState(canContinue, anyChecked, allEssentialsChecked));
  let buttonText = $derived(getButtonText(buttonState, t.generateEditor.buttons));

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
    <p class="placeholder-text">{t.generateEditor.placeholder}</p>
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
</style>
