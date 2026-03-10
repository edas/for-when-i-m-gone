import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import YAML translations
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

// Build translations by merging YAML content with example files
function buildTranslations(
  yamlContent: Record<string, unknown>,
  secretExample: string,
  conditionsExample: string,
  introExample: JSONContent
): Record<string, unknown> {
  const result = { ...yamlContent } as Record<string, unknown>;
  if (result.secretEditor && typeof result.secretEditor === 'object') {
    const secretEditor = result.secretEditor as Record<string, unknown>;
    if (secretEditor.sidePanel && typeof secretEditor.sidePanel === 'object') {
      (secretEditor.sidePanel as Record<string, unknown>).exampleContent = secretExample;
    }
  }
  if (result.howEditor && typeof result.howEditor === 'object') {
    const howEditor = result.howEditor as Record<string, unknown>;
    if (howEditor.sidePanel && typeof howEditor.sidePanel === 'object') {
      (howEditor.sidePanel as Record<string, unknown>).exampleContent = conditionsExample;
    }
  }
  if (result.introEditor && typeof result.introEditor === 'object') {
    const introEditor = result.introEditor as Record<string, unknown>;
    if (introEditor.sidePanel && typeof introEditor.sidePanel === 'object') {
      (introEditor.sidePanel as Record<string, unknown>).exampleContentJson = introExample;
    }
  }
  return result;
}

// Build resources for i18next
const resources = {
  fr: {
    translation: buildTranslations(
      fr as Record<string, unknown>,
      secretExampleFr,
      conditionsExampleFr,
      introExampleFr as JSONContent
    ),
  },
  en: {
    translation: buildTranslations(
      en as Record<string, unknown>,
      secretExampleEn,
      conditionsExampleEn,
      introExampleEn as JSONContent
    ),
  },
};

// Configure i18next (LanguageDetector sets initial language from localStorage then navigator)
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['fr', 'en'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

/** Language resolved at app load; used to seed the data store. */
export const initialLanguage = (i18n.language === 'fr' || i18n.language === 'en' ? i18n.language : 'en') as Language;

export const availableLanguages: { code: Language; name: string }[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];
