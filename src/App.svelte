<script lang="ts">
  import SecurityWarning from './components/SecurityWarning.svelte';
  import SecretEditor from './components/SecretEditor.svelte';
  import { detectLanguage, type Language } from './lib/i18n';

  let currentLang: Language = $state(detectLanguage());
  let securityConfirmed: boolean = $state(false);
  let secretContent: string = $state('');
  let secretSubmitted: boolean = $state(false);

  function handleSecurityContinue(): void {
    securityConfirmed = true;
  }

  function handleSecretContinue(secret: string): void {
    secretContent = secret;
    secretSubmitted = true;
  }

  function handleLanguageChange(lang: Language): void {
    currentLang = lang;
  }
</script>

{#if !securityConfirmed}
  <SecurityWarning
    lang={currentLang}
    onContinue={handleSecurityContinue}
    onLanguageChange={handleLanguageChange}
  />
{:else if !secretSubmitted}
  <SecretEditor
    lang={currentLang}
    onContinue={handleSecretContinue}
  />
{:else}
  <main>
    <h1>For When I'm Gone</h1>
    <p>Secret has been saved. Next steps will appear here.</p>
  </main>
{/if}

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1.5rem;
    padding: 2rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  h1 {
    font-size: 2.5rem;
    color: #ffffff;
  }

  p {
    color: #a0aec0;
    max-width: 500px;
  }
</style>
