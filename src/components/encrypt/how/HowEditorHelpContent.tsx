import { useTranslation } from 'react-i18next';
import { EssentialSection } from '@/components/ui/EssentialSection';
import { HelpSection } from '@/components/ui/HelpSection';
import { CheckboxItem } from '@/components/ui/CheckboxItem';
import formControls from '@/styles/form-controls.module.css';
import helpStyles from '@/components/ui/HelpSection.module.css';
import { Editor } from '@tiptap/react';
import { useHowState } from './useHowState';

interface HowEditorHelpContentProps {
  editor: Editor;
}

export function HowEditorHelpContent({ editor,
}: HowEditorHelpContentProps) {
  const { t } = useTranslation();
  const { title, essentials, optionals } = useHowState(editor);
 
  
  return (
    <HelpSection title={title}>
      <p className={helpStyles.panelIntro}>{t('howEditor.sidePanel.intro')}</p>
      <EssentialSection note={t('howEditor.sidePanel.essentialNote')}>
      {essentials.map(({label, value, strikethrough, setter, description}) => (
        <CheckboxItem
          key={label}
          checked={value}
          label={label}
          description={description}
          strikethrough={strikethrough}
          readonly={!setter}
          onChange={setter ?? undefined}
        />
      ))}
      </EssentialSection>

      <div className={formControls.optionalSection}>
        {optionals.map(({label, value, strikethrough, setter, description}) => (
          <CheckboxItem
            key={label}
            checked={value}
            label={label}
            description={description}
            strikethrough={strikethrough}
            readonly={!setter}
            onChange={setter ?? undefined}
          />
        ))}
      </div>
    </HelpSection>
  );
}
