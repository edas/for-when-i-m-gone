import { useTranslation } from 'react-i18next';
import { EssentialSection } from '../../ui/EssentialSection';
import { HelpSection } from '../../ui/HelpSection';
import { CheckboxItem } from '../../ui/CheckboxItem';
import formControls from '../../../styles/form-controls.module.css';
import helpStyles from '../../ui/HelpSection.module.css';
import { type UseIntroEditorReturn } from './useIntroEditor';
import { useIntroState } from './useIntroState';

interface IntroEditorHelpContentProps {
  editor: UseIntroEditorReturn;
}

export function IntroEditorHelpContent({ editor }: IntroEditorHelpContentProps) {
  const { t } = useTranslation();
  const { title, essentials, optionals } = useIntroState(editor);

  return (
    <HelpSection title={title}>
      <p className={helpStyles.panelIntro}>{t('introEditor.sidePanel.intro')}</p>

      <EssentialSection note={t('introEditor.sidePanel.essentialNote')}>
        {essentials.map(({ label, value, description, readonly, setter }) => (
          <CheckboxItem
            key={label}
            checked={value}
            onChange={setter ?? undefined}
            label={label}
            description={description}
            essential
            readonly={readonly}
          />
        ))}
      </EssentialSection>

      <div className={formControls.optionalSection}>
        {optionals.map(({ label, value, description, readonly, setter }) => (
          <CheckboxItem
            key={label}
            checked={value}
            onChange={setter ?? undefined}
            label={label}
            description={description}
            readonly={readonly}
          />
        ))}
      </div>
    </HelpSection>
  );
}
