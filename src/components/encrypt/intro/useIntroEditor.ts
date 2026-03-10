import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslation } from 'react-i18next';
import { useEncryptDataStore } from '../../../lib/dataStore';
import { getContactTypeLabels } from './introEditorUtils';
import { DateTimeInline } from '../../../lib/tiptap/extensions/datetime';
import { createQuorumInline } from '../../../lib/tiptap/extensions/quorum';
import { createConditionsBlock } from '../../../lib/tiptap/extensions/conditions';
import { createRecipientsBlock } from '../../../lib/tiptap/extensions/recipients';

/**
 * Intro editor hook, intentionally kept small like useConditionEditor.
 */
export function useIntroEditor() {
  const { t } = useTranslation();
  const contactTypeLabels = getContactTypeLabels(t);
  const content = useEncryptDataStore((state) => state.intro?.message ?? null);
  const recipients = useEncryptDataStore((state) => state.who?.recipients ?? []);
  const conditions = useEncryptDataStore((state) => state.how?.conditions ?? null);
  const threshold = useEncryptDataStore((state) => state.how?.threshold ?? 2);
  const recipientsBlock = createRecipientsBlock(recipients, contactTypeLabels);
  const conditionsBlock = createConditionsBlock(conditions);
  const quorumInline = createQuorumInline(threshold);

  return useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        hardBreak: false,
        horizontalRule: false,
        strike: false,
      }),
      
      recipientsBlock,
      conditionsBlock,
      DateTimeInline,
      quorumInline,
    ],
    content: content ?? undefined,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        'data-placeholder': t('introEditor.placeholder'),
      },
    },
  });
}
