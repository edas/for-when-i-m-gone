import { ReactNode } from 'react';
import styles from './EditorLayout.module.css';

interface EditorLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function EditorLayout({ 
  title,
  subtitle,
  children,
}: EditorLayoutProps) {
  return (
    <div className={styles.editorContainer}>
      <main className={styles.mainContent}>
        <div className={styles.editorWrapper}>
          {title && <h1 className={styles.editorTitle}>{title}</h1>}
          {subtitle && <p className={styles.editorSubtitle}>{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
