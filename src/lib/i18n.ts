import fr from './locales/fr.yaml';
import en from './locales/en.yaml';

// Import example content from separate files for easier editing
import secretExampleEn from './locales/examples/secret-example.en.txt?raw';
import secretExampleFr from './locales/examples/secret-example.fr.txt?raw';
import introExampleEn from './locales/examples/intro-example.en.html?raw';
import introExampleFr from './locales/examples/intro-example.fr.html?raw';
import conditionsExampleEn from './locales/examples/conditions-example.en.html?raw';
import conditionsExampleFr from './locales/examples/conditions-example.fr.html?raw';

export type Language = 'fr' | 'en';

export interface Translations {
  common: {
    back: string;
  };
  steps: {
    secret: string;
    who: string;
    how: string;
    intro: string;
    generate: string;
  };
  securityWarning: {
    title: string;
    subtitle: string;
    checkboxLabel: string;
    checkboxLabelLink: string;
    checkboxLabelEnd: string;
    continueButton: string;
  };
  whoEditor: {
    title: string;
    newRecipient: string;
    addRecipient: string;
    removeRecipient: string;
    addContact: string;
    removeContact: string;
    buttons: {
      continueWithoutConfirm: string;
      continueWithoutEssentials: string;
      continue: string;
    };
    fields: {
      name: string;
      contacts: string;
    };
    placeholders: {
      name: string;
      contactValue: string;
      contactComment: string;
    };
    contactTypes: {
      phone: string;
      email: string;
      address: string;
      x: string;
      bluesky: string;
      mastodon: string;
      facebook: string;
      telegram: string;
      whatsapp: string;
      signal: string;
      instagram: string;
      snapchat: string;
      linkedin: string;
      web: string;
      other: string;
    };
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
      recipientCount: string;
      warnings: {
        unnamed: string;
        unnamedPlural: string;
        noContacts: string;
        noContactsAnd: string;
      };
      essentialNote: string;
      checklist: {
        atLeast3: string;
        allNamed: string;
        allHaveContact: string;
        atLeast5: string;
        allHaveAddress: string;
        allHaveEmail: string;
        allHavePhone: string;
      };
      tip: string;
      tip2: string;
    };
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
      insertRecipients: string;
      insertConditions: string;
      insertDateTime: string;
      insertQuorum: string;
    };
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
      essentialNote: string;
      checkboxes: {
        authorIdentity: {
          title: string;
          description: string;
        };
        secretHolders: {
          title: string;
          description: string;
        };
        openingConditions: {
          title: string;
          description: string;
        };
        dated: {
          title: string;
          description: string;
        };
        quorum: {
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
  howEditor: {
    title: string;
    threshold: {
      title: string;
      subtitle: string;
      outOf: string;
      errorOne: string;
    };
    conditions: {
      title: string;
      placeholder: string;
    };
    toolbar: {
      bold: string;
      italic: string;
      underline: string;
      bulletList: string;
      numberedList: string;
    };
    sidePanel: {
      title: string;
      collapse: string;
      expand: string;
      intro: string;
      essentialNote: string;
      checklist: {
        validThreshold: string;
        hasConditions: string;
        lowerThanRecipientCount: string;
        lowerThanRecipientCountHelp: string;
        atLeast3: string;
        atLeast3Help: string;
        atMost5: string;
        atMost5Help: string;
        hasNoOpenConditions: string;
      };
      tip: string;
      generateExample: string;
      exampleContent: string;
    };
    buttons: {
      continueWithoutEssentials: string;
      continue: string;
    };
  };
  thresholdSelector: {
    title: string;
    subtitle: string;
    sidePanel: {
      title: string;
      collapse: string;
      expand: string;
      intro: string;
      warningTooSmall: {
        title: string;
        text: string;
      };
      warningTooLarge: {
        title: string;
        text: string;
      };
    };
    errorOne: string;
    continueButton: string;
  };
}

// Build translations by merging YAML content with example files
function buildTranslations(
  yamlContent: Record<string, unknown>,
  secretExample: string,
  introExample: string,
  conditionsExample: string
): Translations {
  const result = yamlContent as unknown as Translations;
  result.secretEditor.sidePanel.exampleContent = secretExample;
  result.introEditor.sidePanel.exampleContent = introExample;
  result.howEditor.sidePanel.exampleContent = conditionsExample;
  return result;
}

const translations: Record<Language, Translations> = {
  fr: buildTranslations(fr as Record<string, unknown>, secretExampleFr, introExampleFr, conditionsExampleFr),
  en: buildTranslations(en as Record<string, unknown>, secretExampleEn, introExampleEn, conditionsExampleEn),
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
