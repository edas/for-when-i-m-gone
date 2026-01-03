<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    description?: string;
    essential?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let { checked = $bindable(), label, description, essential = false, onchange }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label class="checkbox-item" class:essential>
  <input type="checkbox" {checked} onchange={handleChange} />
  <span class="custom-checkbox"></span>
  {#if description}
    <div class="label-content">
      <span class="label-title">{label}</span>
      <span class="label-description">{description}</span>
    </div>
  {:else}
    <span class="label-text">{label}</span>
  {/if}
</label>

<style>
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
    background: #8b5cf6;
    border-color: #8b5cf6;
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

  .label-text {
    color: #e2e8f0;
    font-size: 0.9rem;
    line-height: 1.4;
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
</style>
