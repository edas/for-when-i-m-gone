import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages, type Language } from '@/lib/i18n';
import { useDataStore, type StoredData } from '@/lib/dataStore';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const setData = useDataStore((state) => state.setData);

  function handleLanguageSelect(event: ChangeEvent<HTMLSelectElement>): void {
    const lang = event.target.value as Language;
    i18n.changeLanguage(lang);
    setData((currentData: StoredData) => ({ ...currentData, language: lang }));
  }

  return (
    <div className={styles.languageSelector}>
      <select value={i18n.language} onChange={handleLanguageSelect}>
        {availableLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
