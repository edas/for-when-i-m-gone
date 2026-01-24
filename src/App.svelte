<script lang="ts">
  import { tick } from 'svelte';
  import SecurityWarning from './components/SecurityWarning.svelte';
  import Locked from './components/locked/Locked.svelte';
  import Encrypt from './components/encrypt/Encrypt.svelte';
  import DecryptEditor from './components/decrypt/DecryptEditor.svelte';
  import { detectLanguage, getTranslations, type Language } from './lib/i18n';
  import { getStoredData, updateStoredData, getAppMode, type AppMode } from './lib/dataStore';

  // Load initial data from stored JSON
  let initialStoredData = getStoredData();

  // Determine app mode from initial DOM data (can change after unlock)
  let appMode: AppMode = $state(getAppMode());

  let currentLang: Language = $state((initialStoredData.language as Language) ?? detectLanguage());
  let securityConfirmed: boolean = $state(false);
  let securityChecked: boolean = $state(!!initialStoredData.security?.confirmedAt);

  async function scrollToTop(): Promise<void> {
    await tick();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }

  async function handleSecurityContinue(checked: boolean): Promise<void> {
    securityChecked = checked;
    securityConfirmed = true;
    await scrollToTop();
  }

  async function handleSecurityBack(): Promise<void> {
    securityConfirmed = false;
    await scrollToTop();
  }

  async function handleUnlocked(newMode: AppMode): Promise<void> {
    // After successful unlock, update app mode to the decrypted mode
    appMode = newMode;
    
    // Reload language from decrypted data
    const newStoredData = getStoredData();
    currentLang = (newStoredData.language as Language) ?? currentLang;
    securityChecked = !!newStoredData.security?.confirmedAt;
    
    await scrollToTop();
  }

  function handleLanguageChange(lang: Language): void {
    currentLang = lang;
    updateStoredData((currentData) => ({ ...currentData, language: lang }));
  }
</script>

{#if !securityConfirmed}
  <SecurityWarning
    lang={currentLang}
    initialChecked={securityChecked}
    onContinue={handleSecurityContinue}
    onLanguageChange={handleLanguageChange}
  />
{:else if appMode === 'locked'}
  <Locked
    lang={currentLang}
    onUnlocked={handleUnlocked}
    onBack={handleSecurityBack}
    onLanguageChange={handleLanguageChange}
  />
{:else if appMode === 'encrypt'}
  <Encrypt
    lang={currentLang}
    onBack={handleSecurityBack}
    onLanguageChange={handleLanguageChange}
  />
{:else}
  <!-- Decrypt mode - to be implemented later -->
  <div class="app-container">
    <main>
      <h1>Decrypt Mode</h1>
      <p>This mode will be implemented later.</p>
      <button onclick={handleSecurityBack}>Back</button>
    </main>
  </div>
{/if}

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 1.5rem;
    padding: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #ffffff;
  }

  p {
    color: #a0aec0;
    max-width: 500px;
  }

  button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    color: #a0aec0;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
</style>
