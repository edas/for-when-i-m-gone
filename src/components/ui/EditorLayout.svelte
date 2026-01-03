<script lang="ts">
  import type { Snippet } from 'svelte';
  import SidePanel from './SidePanel.svelte';

  interface Props {
    title?: string;
    subtitle?: string;
    sidePanelOpen: boolean;
    collapseLabel: string;
    expandLabel: string;
    wideSidePanel?: boolean;
    onToggleSidePanel: () => void;
    children: Snippet;
    sidePanelContent: Snippet;
    toolbar?: Snippet;
  }

  let { 
    title,
    subtitle,
    sidePanelOpen, 
    collapseLabel, 
    expandLabel, 
    wideSidePanel = false,
    onToggleSidePanel, 
    children,
    sidePanelContent,
    toolbar
  }: Props = $props();
</script>

<div class="editor-container">
  <main class="main-content" class:panel-closed={!sidePanelOpen}>
    <div class="editor-wrapper">
      {#if title}
        <h1 class="editor-title">{title}</h1>
      {/if}
      {#if subtitle}
        <p class="editor-subtitle">{subtitle}</p>
      {/if}
      
      {#if toolbar}
        {@render toolbar()}
      {/if}

      {@render children()}
    </div>
  </main>

  <SidePanel
    open={sidePanelOpen}
    {collapseLabel}
    {expandLabel}
    wide={wideSidePanel}
    onToggle={onToggleSidePanel}
  >
    {@render sidePanelContent()}
  </SidePanel>
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

  .editor-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .editor-subtitle {
    color: #a0aec0;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  /* Responsive */
  @media (max-width: 900px) {
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

    .editor-title {
      font-size: 1.5rem;
    }
  }
</style>
