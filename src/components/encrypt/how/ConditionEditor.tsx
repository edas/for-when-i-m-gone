import howStyles from './HowEditor.module.css';
import styles from './ConditionEditor.module.css';
import { useTranslation } from 'react-i18next';
import { Editor, EditorContent } from '@tiptap/react';
import { Icon, type IconName } from '@/components/ui/Icons';
import tiptap from '@/components/ui/TipTapEditor.module.css';

export function ConditionEditor({ editor }: { editor: Editor }) {
  const { t } = useTranslation();
  
  return (
    <section className={howStyles.section}>
        <label className={howStyles.sectionSubtitle}>
          {t('howEditor.conditions.title')}
        </label>
        
        <div className={tiptap.editorWrapper}>
          <RichTextToolbar editor={editor} />
          <EditorContent editor={editor} className={tiptap.tiptapEditor} />
        </div>
      </section>
  );
}

interface ToolbarButton {
  icon: IconName;
  label: string;
  action: () => void;
}


function RichTextToolbar({ editor }: { editor: Editor }) {

  const { t } = useTranslation();
  
  const styleButtons: ToolbarButton[] = [
    { icon: 'bold', label: t('howEditor.toolbar.bold'), action: () => editor?.chain().focus().toggleBold().run() },
    { icon: 'italic', label: t('howEditor.toolbar.italic'), action: () => editor?.chain().focus().toggleItalic().run() },
    { icon: 'underline', label: t('howEditor.toolbar.underline'), action: () => editor?.chain().focus().toggleUnderline().run() },
  ];

  const listButtons: ToolbarButton[] = [
    { icon: 'list-bullet', label: t('howEditor.toolbar.bulletList'), action: () => editor?.chain().focus().toggleBulletList().run() },
    { icon: 'list-numbered', label: t('howEditor.toolbar.numberedList'), action: () => editor?.chain().focus().toggleOrderedList().run() },
  ];

  return (
    <div className={styles.toolbar}>
      <ButtonGroup buttons={styleButtons} editor={editor} />
      <div className={styles.toolbarDivider}></div>
      <ButtonGroup buttons={listButtons} editor={editor} />

    </div>
  );
}

function ButtonGroup({ buttons, editor }: { buttons: ToolbarButton[], editor: Editor }) {
  return (
    <div className={styles.toolbarGroup}>
      {buttons.map((btn) => (
        <button 
        key={btn.icon}
        className={styles.toolbarBtn}
        onClick={btn.action} 
        title={btn.label}
        disabled={!editor}
      >
          <Icon name={btn.icon} size={18} />
        </button>
      ))}
    </div>
  );
}