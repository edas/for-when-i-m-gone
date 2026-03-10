import { useEditor } from "@tiptap/react";
import type { JSONContent } from '@tiptap/core';
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";

export function useConditionEditor(
  defaultValue: JSONContent | undefined,
  onConditionsChange: (conditions: JSONContent | null) => void,
) {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        hardBreak: false,
        horizontalRule: false,
        strike: false,
        heading: false,
      }),
    ],
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