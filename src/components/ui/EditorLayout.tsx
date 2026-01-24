import { ReactNode } from 'react';
import styles from './EditorLayout.module.css';

interface EditorLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  toolbar?: ReactNode;
}

export function EditorLayout({ 
  title,
  subtitle,
  children,
  toolbar,
}: EditorLayoutProps) {
  return (
    <div className={styles.editorContainer}>
      <main className={styles.mainContent}>
        <div className={styles.editorWrapper}>
          {title && <h1 className={styles.editorTitle}>{title}</h1>}
          {subtitle && <p className={styles.editorSubtitle}>{subtitle}</p>}
          
          {toolbar}

          {children}
        </div>
      </main>
    </div>
  );
}

export default EditorLayout;
