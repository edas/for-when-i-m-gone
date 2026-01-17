<script lang="ts">
  import Icon from './Icons.svelte';

  interface Props {
    text: string;
  }

  let { text }: Props = $props();
</script>

<div class="warning-section">
  <div class="warning-icon">
    <Icon name="alert-triangle" size={20} />
  </div>
  <p class="warning-text">{text}</p>
</div>

<style>
  .warning-section {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    margin-top: 1.5rem;
    background: rgba(251, 146, 60, 0.1);
    border: 1px solid rgba(251, 146, 60, 0.25);
    border-radius: 10px;
  }

  .warning-icon {
    flex-shrink: 0;
    color: #fb923c;
  }

  .warning-text {
    font-size: 0.85rem;
    color: #fdba74;
    line-height: 1.5;
    margin: 0;
  }
</style>
