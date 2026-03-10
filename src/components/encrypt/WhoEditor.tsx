import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEncryptDataStore } from '../../lib/dataStore';
import { EditorLayout } from '../ui/EditorLayout';
import { ActionButtons } from '../ui/ActionButtons';
import styles from './WhoEditor.module.css';
import { type Recipient } from '../../lib/types/recipient';
import { computeDerivedState, getVariantAndTitle } from './whoEditorUtils';
import { RecipientsList } from './recipients/WhoEditorRecipientsList';
import { WhoEditorHelpContent } from './recipients/WhoEditorHelpContent';

const noRecipients: Recipient[] = []

interface WhoEditorProps {
  onContinue: (recipients: Recipient[]) => void;
  onBack: (recipients: Recipient[]) => void;
}

export function WhoEditor({ onContinue, onBack }: WhoEditorProps) {
  const { t } = useTranslation();

  // Derived states
  const recipients = useEncryptDataStore((state) => state.who?.recipients ?? noRecipients);
  const derived = useMemo(() => computeDerivedState(recipients), [recipients]);
  const essentials = [derived.hasAtLeast3, derived.allNamed, derived.allHaveContact];
  const optional = [derived.hasAtLeast5, derived.allHaveAddress, derived.allHaveEmail, derived.allHavePhone];
  const { variant, title } = getVariantAndTitle(derived.hasAtLeast2, derived.unnamedCount, essentials, optional, t);

  return (
    <EditorLayout title={t('whoEditor.title')}>
      <p className={styles.description}>{t('whoEditor.description')}</p>
      <div className={styles.contentWrapper}>
        <RecipientsList />

        <WhoEditorHelpContent recipients={recipients} title={title} />

        <ActionButtons
          backLabel={t('common.back')}
          continueLabel={t('common.continue')}
          buttonState={derived.hasAtLeast2 ? "complete" : "none"}
          disabled={!derived.hasAtLeast2 || !derived.allNamed}
          onBack={() => onBack(recipients)}
          onContinue={() => derived.hasAtLeast2 && onContinue(recipients)}
          variant={variant}
        />
      </div>
    </EditorLayout>
  );
}

