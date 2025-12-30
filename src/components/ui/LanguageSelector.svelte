<script lang="ts">
  import { availableLanguages, type Language } from '../../lib/i18n';

  interface Props {
    lang: Language;
    onLanguageChange: (lang: Language) => void;
  }

  let { lang, onLanguageChange }: Props = $props();

  function handleLanguageSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    onLanguageChange(select.value as Language);
  }
</script>

<div class="language-selector">
  <select value={lang} onchange={handleLanguageSelect}>
    {#each availableLanguages as language}
      <option value={language.code}>{language.name}</option>
    {/each}
  </select>
</div>

<style>
  .language-selector {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
  }

  .language-selector select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #e0e0e0;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .language-selector select:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .language-selector select option {
    background: #1a1a2e;
    color: #e0e0e0;
  }
</style>
