import { useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { getBaseStarterKit } from '@/lib/tiptap/createEditor';

export function useConditionEditor(
  defaultValue: JSONContent | undefined,
  onConditionsChange: (conditions: JSONContent | null) => void,
) {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [getBaseStarterKit({levels: [3]})],
    content: defaultValue ?? undefined,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        'data-placeholder': t('howEditor.conditions.placeholder'),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onConditionsChange(currentEditor.getJSON());
    },
  });
  return editor;
}