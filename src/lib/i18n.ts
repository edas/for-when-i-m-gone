import fr from './locales/fr.yaml';
import en from './locales/en.yaml';

// Import example content from separate files for easier editing
import secretExampleEn from './locales/examples/secret-example.en.txt?raw';
import secretExampleFr from './locales/examples/secret-example.fr.txt?raw';

import conditionsExampleEn from './locales/examples/conditions-example.en.html?raw';
import conditionsExampleFr from './locales/examples/conditions-example.fr.html?raw';

import introExampleEn from './locales/examples/intro-example.en.json';
import introExampleFr from './locales/examples/intro-example.fr.json';

import type { JSONContent } from '@tiptap/core';

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
  decryptSteps: {
    recovery: string;
    decrypt: string;
  };
  lockedSteps: {
    unlock: string;
  };
  unlockEditor: {
    title: string;
    subtitle: string;
    placeholder: string;
    unlocking: string;
    error: string;
    buttons: {
      unlock: string;
    };
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
    };
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
      notListedPublicly: string;
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
      exampleContentJson: JSONContent;
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
      quorumWarning: string;
      generateExample: string;
      exampleContent: string;
    };
    buttons: {
      continueWithoutEssentials: string;
      continue: string;
    };
  };
  generateEditor: {
    title: string;
    placeholder: string;
    processing: string;
    ready: string;
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
    };
    shares: {
      title: string;
      intro: string;
      copyButton: string;
      unnamedRecipient: string;
    };
    buttons: {
      continueWithoutConfirm: string;
      continueWithoutEssentials: string;
      continue: string;
    };
  };
  recoveryEditor: {
    title: string;
    subtitle: string;
    placeholder: string;
    buttons: {
      continue: string;
    };
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
    };
  };
  decryptEditor: {
    title: string;
    subtitle: string;
    processing: string;
    success: string;
    error: string;
    buttons: {
      back: string;
    };
    sidePanel: {
      title: string;
      intro: string;
      collapse: string;
      expand: string;
    };
  };
}

// Build translations by merging YAML content with example files
function buildTranslations(
  yamlContent: Record<string, unknown>,
  secretExample: string,
  conditionsExample: string,
  introExample: JSONContent
): Translations {
  const result = yamlContent as unknown as Translations;
  result.secretEditor.sidePanel.exampleContent = secretExample;
  result.howEditor.sidePanel.exampleContent = conditionsExample;
  result.introEditor.sidePanel.exampleContentJson = introExample;
  return result;
}

const translations: Record<Language, Translations> = {
  fr: buildTranslations(fr as Record<string, unknown>, secretExampleFr, conditionsExampleFr, introExampleFr as JSONContent),
  en: buildTranslations(en as Record<string, unknown>, secretExampleEn, conditionsExampleEn, introExampleEn as JSONContent),
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
