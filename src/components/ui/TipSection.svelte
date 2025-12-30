<script lang="ts">
  import Icon from './Icons.svelte';

  interface Props {
    text: string;
  }

  let { text }: Props = $props();
</script>

<div class="tip-section">
  <div class="tip-icon">
    <Icon name="info" size={20} />
  </div>
  <p class="tip-text">{text}</p>
</div>

<style>
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

  .tip-text {
    font-size: 0.85rem;
    color: #93c5fd;
    line-height: 1.5;
    margin: 0;
  }
</style>
