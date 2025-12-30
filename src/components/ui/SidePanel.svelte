<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icons.svelte';

  interface Props {
    open: boolean;
    collapseLabel: string;
    expandLabel: string;
    wide?: boolean;
    onToggle: () => void;
    children: Snippet;
  }

  let { open, collapseLabel, expandLabel, wide = false, onToggle, children }: Props = $props();
</script>

<aside class="side-panel" class:closed={!open} class:wide>
  <button class="toggle-button" onclick={onToggle}>
    {#if open}
      <Icon name="chevron-right" />
      <span class="toggle-text">{collapseLabel}</span>
    {:else}
      <Icon name="chevron-left" />
      <span class="toggle-text">{expandLabel}</span>
    {/if}
  </button>

  {#if open}
    <div class="panel-content">
      {@render children()}
    </div>
  {/if}
</aside>

<style>
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

  .side-panel.wide {
    width: 400px;
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

  .panel-content :global(h2) {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.25rem;
    color: #ffffff;
    margin-bottom: 1.25rem;
  }

  .panel-content :global(h3) {
    font-size: 0.85rem;
    font-weight: 600;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    padding-top: 0.5rem;
  }

  .panel-content :global(.panel-intro) {
    font-size: 0.9rem;
    color: #a0aec0;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }

  .panel-content :global(.regular-section) {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .panel-content :global(.optional-section) {
    opacity: 0.85;
  }

  .panel-content :global(.section-divider) {
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
    margin: 2rem 0;
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
  }

  @media (max-width: 600px) {
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

    .toggle-button :global(svg) {
      transform: rotate(90deg);
    }
  }
</style>
