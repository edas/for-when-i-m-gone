import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Icon, type IconName } from './Icons';
import styles from './RichTextToolbar.module.css';
import { useTranslation } from 'react-i18next';
import { Level } from '@tiptap/extension-heading';

interface RichTextToolbarProps {
  editor: Editor | null;
  insertButtons?: ToolbarButton[];
  headingLevel: number;
}

export interface ToolbarButton {
  icon: IconName;
  label: string;
  action: () => void;
  disabled?: boolean;
  active?: boolean;
}

export function RichTextToolbar({ editor, insertButtons, headingLevel }: RichTextToolbarProps) {
  const { t } = useTranslation();
  const isHeadingActive = Boolean(
    useEditorState({
      editor,
      selector: ({ editor: e }) => e?.isActive('heading') ?? false,
    }),
  );

  // Editor commands
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleHeading = () => editor?.chain().focus().toggleHeading({ level: headingLevel as Level }).run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();

  const styleButtons: ToolbarButton[] = [
    { icon: 'heading', label: t('howEditor.toolbar.heading'), action: toggleHeading, active: isHeadingActive },
    { icon: 'bold', label: t('howEditor.toolbar.bold'), action: toggleBold },
    { icon: 'italic', label: t('howEditor.toolbar.italic'), action: toggleItalic },
    { icon: 'underline', label: t('howEditor.toolbar.underline'), action: toggleUnderline },
  ];

  const listButtons: ToolbarButton[] = [
    { icon: 'list-bullet', label: t('howEditor.toolbar.bulletList'), action: toggleBulletList },
    { icon: 'list-numbered', label: t('howEditor.toolbar.numberedList'), action: toggleOrderedList },
  ];

  const renderButtonGroup = (buttons: ToolbarButton[], isInsert = false) => (
    <div className={styles.toolbarGroup}>
      {buttons.map((btn) => (
        <button
          key={btn.icon}
          className={`${styles.toolbarBtn} ${isInsert ? styles.insertBtn : ''} ${btn.disabled ? styles.alreadyInserted : ''} ${btn.active ? styles.active : ''}`}
          onClick={btn.action}
          title={btn.label}
          disabled={!editor || btn.disabled}
        >
          <Icon name={btn.icon} size={18} />
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.toolbar}>
      {renderButtonGroup(styleButtons)}
      <div className={styles.toolbarDivider}></div>
      {renderButtonGroup(listButtons)}
      
      {insertButtons && (
        <>
          <div className={styles.toolbarDivider}></div>
          {renderButtonGroup(insertButtons, true)}
        </>
      )}
    </div>
  );
}
