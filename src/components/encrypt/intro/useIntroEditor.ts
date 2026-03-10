import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslation } from 'react-i18next';
import { useEncryptDataStore } from '../../../lib/dataStore';
import {
  ConditionsBlock,
  DynamicDataExtension,
  QuorumInline,
  RecipientsBlock,
} from '../../../lib/tiptap/extensions';
import { DateTimeInline } from '../../../lib/tiptap/extensions/datetime';

/**
 * Intro editor hook, intentionally kept small like useConditionEditor.
 */
export function useIntroEditor() {
  const { t } = useTranslation();
  const content = useEncryptDataStore((state) => state.intro?.message ?? null);

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
      DynamicDataExtension,
      RecipientsBlock,
      ConditionsBlock,
      DateTimeInline,
      QuorumInline,
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
