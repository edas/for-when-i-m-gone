import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages, type Language } from '../../lib/i18n';
import { useData } from '../../lib/DataContext';
import './LanguageSelector.css';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const { updateStoredData } = useData();

  function handleLanguageSelect(event: ChangeEvent<HTMLSelectElement>): void {
    const lang = event.target.value as Language;
    i18n.changeLanguage(lang);
    updateStoredData((currentData) => ({ ...currentData, language: lang }));
  }

  return (
    <div className="language-selector">
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

export default LanguageSelector;
