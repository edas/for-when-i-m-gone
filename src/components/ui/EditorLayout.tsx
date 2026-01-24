import { ReactNode } from 'react';
import './EditorLayout.css';

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
    <div className="editor-container">
      <main className="main-content">
        <div className="editor-wrapper">
          {title && <h1 className="editor-title">{title}</h1>}
          {subtitle && <p className="editor-subtitle">{subtitle}</p>}
          
          {toolbar}

          {children}
        </div>
      </main>
    </div>
  );
}

export default EditorLayout;
