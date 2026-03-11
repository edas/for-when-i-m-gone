import howStyles from './HowEditor.module.css';
import { useTranslation } from 'react-i18next';
import { Editor, EditorContent } from '@tiptap/react';
import tiptap from '@/components/ui/TipTapEditor.module.css';
import { RichTextToolbar } from '@/components/ui/RichTextToolbar';

export function ConditionEditor({ editor }: { editor: Editor }) {
  const { t } = useTranslation();

  return (
    <section className={howStyles.section}>
      <label className={howStyles.sectionSubtitle}>
        {t('howEditor.conditions.title')}
      </label>

      <div className={tiptap.editorWrapper}>
        <RichTextToolbar editor={editor} headingLevel={3} />
        <EditorContent editor={editor} className={tiptap.tiptapEditor} />
      </div>
    </section>
  );
}
