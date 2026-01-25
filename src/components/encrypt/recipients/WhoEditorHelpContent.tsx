import { useTranslation } from 'react-i18next';
import { EssentialSection } from '../../ui/EssentialSection';
import { HelpSection } from '../../ui/HelpSection';
import { CheckboxItem } from '../../ui/CheckboxItem';
import formControls from '../../../styles/form-controls.module.css';
import helpStyles from '../../ui/HelpSection.module.css';
import { computeDerivedState } from '../whoEditorUtils';
import { type Recipient } from '../../../lib/types/recipient';

interface WhoEditorHelpContentProps {
  recipients: Recipient[];
  title: string;
}

export function WhoEditorHelpContent({ recipients, title }: WhoEditorHelpContentProps) {
  const { t } = useTranslation();
  const derived = computeDerivedState(recipients);
  const { hasAtLeast3, hasAtLeast5, allNamed, allHaveContact, allHaveAddress, allHaveEmail, allHavePhone } = derived;

  return (
    <HelpSection title={title}>     
      <EssentialSection note={t('whoEditor.sidePanel.essentialNote')}>
        <CheckboxItem checked={hasAtLeast3} label={t('whoEditor.sidePanel.checklist.atLeast3')} readonly />
        <CheckboxItem checked={allNamed} label={t('whoEditor.sidePanel.checklist.allNamed')} readonly />
        <CheckboxItem checked={allHaveContact} label={t('whoEditor.sidePanel.checklist.allHaveContact')} readonly />
      </EssentialSection>

      <div className={formControls.optionalSection}>
        <CheckboxItem checked={hasAtLeast5} label={t('whoEditor.sidePanel.checklist.atLeast5')} readonly />
        <CheckboxItem checked={allHaveAddress} label={t('whoEditor.sidePanel.checklist.allHaveAddress')} readonly />
        <CheckboxItem checked={allHaveEmail} label={t('whoEditor.sidePanel.checklist.allHaveEmail')} readonly />
        <CheckboxItem checked={allHavePhone} label={t('whoEditor.sidePanel.checklist.allHavePhone')} readonly />

        <p className={helpStyles.panelIntro}>{t('whoEditor.sidePanel.tip2')}</p> 
        <p className={helpStyles.panelIntro}>{t('whoEditor.sidePanel.tip')}</p> 
      </div>
    </HelpSection>
  );
}
