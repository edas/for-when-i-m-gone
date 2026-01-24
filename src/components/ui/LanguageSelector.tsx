import { ChangeEvent } from 'react';
import { availableLanguages, type Language } from '../../lib/i18n';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSelector({ lang, onLanguageChange }: LanguageSelectorProps) {
  function handleLanguageSelect(event: ChangeEvent<HTMLSelectElement>): void {
    onLanguageChange(event.target.value as Language);
  }

  return (
    <div className="language-selector">
      <select value={lang} onChange={handleLanguageSelect}>
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
