import fr from './locales/fr.yaml';
import en from './locales/en.yaml';

// Import example content from separate files for easier editing
import secretExampleEn from './locales/examples/secret-example.en.txt?raw';
import secretExampleFr from './locales/examples/secret-example.fr.txt?raw';
import introExampleEn from './locales/examples/intro-example.en.html?raw';
import introExampleFr from './locales/examples/intro-example.fr.html?raw';

export type Language = 'fr' | 'en';

export interface Translations {
  common: {
    back: string;
  };
  securityWarning: {
    title: string;
    subtitle: string;
    checkboxLabel: string;
    checkboxLabelLink: string;
    checkboxLabelEnd: string;
    continueButton: string;
  };
  secretEditor: {
    title: string;
    placeholder: string;
    sidePanel: {
      title: string;
      essentialNote: string;
      collapse: string;
      expand: string;
      checkboxes: {
        emails: string;
        phoneCodes: string;
        cloudAccounts: string;
        computerLogins: string;
        otherPasswords: string;
        domainManager: string;
        passwordManager: string;
        backups: string;
        crypto: string;
      };
      sectionOptional: string;
      generateExample: string;
      exampleContent: string;
    };
    buttons: {
      continueWithoutConfirm: string;
      continueWithoutEssentials: string;
      continue: string;
    };
  };
  introEditor: {
    title: string;
    subtitle: string;
    placeholder: string;
    toolbar: {
      heading: string;
      paragraph: string;
      bold: string;
      italic: string;
      underline: string;
      bulletList: string;
      numberedList: string;
    };
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
      essentialNote: string;
      checkboxes: {
        secretHolders: {
          title: string;
          description: string;
        };
        openCases: {
          title: string;
          description: string;
        };
        noOpenCases: {
          title: string;
          description: string;
        };
        directives: {
          title: string;
          description: string;
        };
      };
      tip: string;
      generateExample: string;
      exampleContent: string;
    };
    buttons: {
      continueWithoutConfirm: string;
      continueWithoutEssentials: string;
      continue: string;
    };
  };
}

// Build translations by merging YAML content with example files
function buildTranslations(
  yamlContent: Record<string, unknown>,
  secretExample: string,
  introExample: string
): Translations {
  const result = yamlContent as unknown as Translations;
  result.secretEditor.sidePanel.exampleContent = secretExample;
  result.introEditor.sidePanel.exampleContent = introExample;
  return result;
}

const translations: Record<Language, Translations> = {
  fr: buildTranslations(fr as Record<string, unknown>, secretExampleFr, introExampleFr),
  en: buildTranslations(en as Record<string, unknown>, secretExampleEn, introExampleEn),
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

export const availableLanguages: { code: Language; name: string }[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];
