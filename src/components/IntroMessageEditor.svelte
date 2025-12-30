<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';

  interface Props {
    lang: Language;
    initialValue?: string;
    onContinue: (message: string) => void;
    onBack: (message: string) => void;
  }

  let { lang, initialValue, onContinue, onBack }: Props = $props();

  let messageHtml: string = $state(untrack(() => initialValue ?? ''));
  let sidePanelOpen: boolean = $state(true);
  let editorElement: HTMLDivElement | null = $state(null);

  // Checkbox states for verification
  let checkSecretHolders: boolean = $state(false);
  let checkOpenCases: boolean = $state(false);
  let checkNoOpenCases: boolean = $state(false);
  let checkDirectives: boolean = $state(false);

  let t = $derived(getTranslations(lang));

  let hasContent = $derived(messageHtml.trim().length > 0);

  let allChecked = $derived(checkSecretHolders && checkOpenCases && checkNoOpenCases && checkDirectives);

  let anyChecked = $derived(checkSecretHolders || checkOpenCases || checkNoOpenCases || checkDirectives);

  type ButtonState = 'none' | 'partial' | 'complete';

  let buttonState = $derived.by((): ButtonState => {
    if (!anyChecked) return 'none';
    if (!allChecked) return 'partial';
    return 'complete';
  });

  let buttonText = $derived.by(() => {
    switch (buttonState) {
      case 'none': return t.introEditor.buttons.continueWithoutConfirm;
      case 'partial': return t.introEditor.buttons.continuePartial;
      case 'complete': return t.introEditor.buttons.continue;
    }
  });

  function handleContinue(): void {
    if (hasContent && editorElement) {
      onContinue(editorElement.innerHTML);
    }
  }

  function toggleSidePanel(): void {
    sidePanelOpen = !sidePanelOpen;
  }

  function handleInput(): void {
    if (editorElement) {
      messageHtml = editorElement.innerHTML;
    }
  }

  function execCommand(command: string, value: string | undefined = undefined): void {
    document.execCommand(command, false, value);
    editorElement?.focus();
  }

  function formatBlock(tag: string): void {
    document.execCommand('formatBlock', false, tag);
    editorElement?.focus();
  }

  // Initialize editor content with initial value when mounted
  $effect(() => {
    if (editorElement && initialValue && !editorElement.innerHTML) {
      editorElement.innerHTML = initialValue;
    }
  });

  function generateExample(): void {
    if (editorElement) {
      const example = t.introEditor.sidePanel.exampleContent;
      const currentContent = editorElement.innerHTML.trim();
      if (currentContent) {
        editorElement.innerHTML = currentContent + '<br><br>' + example;
      } else {
        editorElement.innerHTML = example;
      }
      messageHtml = editorElement.innerHTML;
      editorElement.focus();
    }
  }
</script>

<div class="editor-container">
  <main class="main-content" class:panel-closed={!sidePanelOpen}>
    <div class="editor-wrapper">
      <h1>{t.introEditor.title}</h1>
      <p class="subtitle">{t.introEditor.subtitle}</p>
      
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn" onclick={() => formatBlock('h2')} title={t.introEditor.toolbar.heading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12h8M4 6v12M12 6v12M14 8h4l-4 8h4"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick={() => formatBlock('p')} title={t.introEditor.toolbar.paragraph}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 1 0 0 9H13"/>
            </svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button class="toolbar-btn" onclick={() => execCommand('bold')} title={t.introEditor.toolbar.bold}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick={() => execCommand('italic')} title={t.introEditor.toolbar.italic}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick={() => execCommand('underline')} title={t.introEditor.toolbar.underline}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
              <line x1="4" y1="20" x2="20" y2="20"/>
            </svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>
        <div class="toolbar-group">
          <button class="toolbar-btn" onclick={() => execCommand('insertUnorderedList')} title={t.introEditor.toolbar.bulletList}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="9" y1="6" x2="20" y2="6"/>
              <line x1="9" y1="12" x2="20" y2="12"/>
              <line x1="9" y1="18" x2="20" y2="18"/>
              <circle cx="5" cy="6" r="1" fill="currentColor"/>
              <circle cx="5" cy="12" r="1" fill="currentColor"/>
              <circle cx="5" cy="18" r="1" fill="currentColor"/>
            </svg>
          </button>
          <button class="toolbar-btn" onclick={() => execCommand('insertOrderedList')} title={t.introEditor.toolbar.numberedList}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="10" y1="6" x2="20" y2="6"/>
              <line x1="10" y1="12" x2="20" y2="12"/>
              <line x1="10" y1="18" x2="20" y2="18"/>
              <text x="4" y="7" font-size="6" fill="currentColor" stroke="none">1</text>
              <text x="4" y="13" font-size="6" fill="currentColor" stroke="none">2</text>
              <text x="4" y="19" font-size="6" fill="currentColor" stroke="none">3</text>
            </svg>
          </button>
        </div>
      </div>

      <div
        class="rich-editor"
        contenteditable="true"
        bind:this={editorElement}
        oninput={handleInput}
        role="textbox"
        aria-multiline="true"
        data-placeholder={t.introEditor.placeholder}
      ></div>

      <div class="button-container">
        <button class="back-button" onclick={() => onBack(editorElement?.innerHTML ?? '')}>
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
        <span class="toggle-text">{t.introEditor.sidePanel.collapse}</span>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span class="toggle-text">{t.introEditor.sidePanel.expand}</span>
      {/if}
    </button>

    {#if sidePanelOpen}
      <div class="panel-content">
        <h2>{t.introEditor.sidePanel.title}</h2>
        <p class="panel-intro">{t.introEditor.sidePanel.intro}</p>

        <div class="essential-section">
          <div class="essential-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.83L19.13 19H4.87L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>

          <label class="checkbox-item essential">
            <input type="checkbox" bind:checked={checkSecretHolders} />
            <span class="custom-checkbox"></span>
            <div class="label-content">
              <span class="label-title">{t.introEditor.sidePanel.checkboxes.secretHolders.title}</span>
              <span class="label-description">{t.introEditor.sidePanel.checkboxes.secretHolders.description}</span>
            </div>
          </label>

          <label class="checkbox-item essential">
            <input type="checkbox" bind:checked={checkOpenCases} />
            <span class="custom-checkbox"></span>
            <div class="label-content">
              <span class="label-title">{t.introEditor.sidePanel.checkboxes.openCases.title}</span>
              <span class="label-description">{t.introEditor.sidePanel.checkboxes.openCases.description}</span>
            </div>
          </label>

          <label class="checkbox-item essential">
            <input type="checkbox" bind:checked={checkNoOpenCases} />
            <span class="custom-checkbox"></span>
            <div class="label-content">
              <span class="label-title">{t.introEditor.sidePanel.checkboxes.noOpenCases.title}</span>
              <span class="label-description">{t.introEditor.sidePanel.checkboxes.noOpenCases.description}</span>
            </div>
          </label>

          <p class="essential-note">{t.introEditor.sidePanel.essentialNote}</p>
        </div>

        <div class="optional-section">
          <label class="checkbox-item">
            <input type="checkbox" bind:checked={checkDirectives} />
            <span class="custom-checkbox"></span>
            <div class="label-content">
              <span class="label-title">{t.introEditor.sidePanel.checkboxes.directives.title}</span>
              <span class="label-description">{t.introEditor.sidePanel.checkboxes.directives.description}</span>
            </div>
          </label>
        </div>

        <div class="tip-section">
          <div class="tip-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <p class="tip-text">{t.introEditor.sidePanel.tip}</p>
        </div>

        <div class="section-divider"></div>

        <button class="generate-example-button" onclick={generateExample}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {t.introEditor.sidePanel.generateExample}
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
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .subtitle {
    color: #a0aec0;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
  }

  .toolbar-group {
    display: flex;
    gap: 0.25rem;
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 0.5rem;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .toolbar-btn:active {
    background: rgba(255, 255, 255, 0.15);
  }

  .toolbar-btn svg {
    width: 18px;
    height: 18px;
  }

  /* Rich Editor */
  .rich-editor {
    flex: 1;
    min-height: 350px;
    padding: 1.5rem;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.05rem;
    line-height: 1.7;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0 0 12px 12px;
    color: #e2e8f0;
    overflow-y: auto;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .rich-editor:empty::before {
    content: attr(data-placeholder);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  .rich-editor:focus {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .rich-editor :global(h2) {
    font-size: 1.4rem;
    font-weight: 600;
    color: #ffffff;
    margin: 1rem 0 0.75rem 0;
  }

  .rich-editor :global(h2:first-child) {
    margin-top: 0;
  }

  .rich-editor :global(p) {
    margin-bottom: 0.75rem;
  }

  .rich-editor :global(ul), .rich-editor :global(ol) {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .rich-editor :global(li) {
    margin-bottom: 0.35rem;
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
    width: 400px;
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
    margin-bottom: 0.75rem;
  }

  .panel-intro {
    font-size: 0.9rem;
    color: #a0aec0;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }

  .essential-section {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    margin-top: 0.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(245, 158, 11, 0.2);
  }

  .optional-section {
    margin-bottom: 0;
  }

  .section-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
    margin: 2rem 0;
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

  .label-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label-title {
    color: #e2e8f0;
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .label-description {
    color: #8892a0;
    font-size: 0.8rem;
    line-height: 1.4;
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

  .tip-section {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    margin-top: 1.5rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 10px;
  }

  .tip-icon {
    flex-shrink: 0;
    color: #3b82f6;
  }

  .tip-icon svg {
    width: 20px;
    height: 20px;
  }

  .tip-text {
    font-size: 0.85rem;
    color: #93c5fd;
    line-height: 1.5;
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

    .rich-editor {
      min-height: 200px;
    }

    h1 {
      font-size: 1.5rem;
    }

    .toolbar {
      flex-wrap: wrap;
      justify-content: center;
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
