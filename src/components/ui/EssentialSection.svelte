<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icons.svelte';

  interface Props {
    note?: string;
    children: Snippet;
  }

  let { note, children }: Props = $props();
</script>

<div class="essential-section">
  <div class="essential-badge">
    <Icon name="warning" size={16} />
  </div>

  {@render children()}

  {#if note}
    <p class="essential-note">{note}</p>
  {/if}
</div>

<style>
  .essential-section {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

  .essential-note {
    font-size: 0.8rem;
    color: #fbbf24;
    line-height: 1.5;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(245, 158, 11, 0.2);
  }
</style>
