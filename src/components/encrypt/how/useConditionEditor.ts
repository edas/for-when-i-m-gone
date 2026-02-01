import { JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";

export function useConditionEditor(defaultValue: JSONContent | undefined) {
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
  });
  return editor;
}