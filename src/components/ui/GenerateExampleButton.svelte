<script lang="ts">
  import Icon from './Icons.svelte';

  interface Props {
    label: string;
    onclick: () => void;
  }

  let { label, onclick }: Props = $props();
</script>

<button class="generate-example-button" {onclick}>
  <Icon name="plus" size={18} />
  {label}
</button>

<style>
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
</style>
