import { ReactNode } from 'react';
import { SidePanel } from './SidePanel';
import './EditorLayout.css';

interface EditorLayoutProps {
  title?: string;
  subtitle?: string;
  sidePanelOpen: boolean;
  collapseLabel: string;
  expandLabel: string;
  wideSidePanel?: boolean;
  onToggleSidePanel: () => void;
  children: ReactNode;
  sidePanelContent: ReactNode;
  toolbar?: ReactNode;
  editorId?: string;
}

export function EditorLayout({ 
  title,
  subtitle,
  sidePanelOpen, 
  collapseLabel, 
  expandLabel, 
  wideSidePanel = false,
  onToggleSidePanel, 
  children,
  sidePanelContent,
  toolbar,
  editorId
}: EditorLayoutProps) {
  return (
    <div className="editor-container">
      <main className={`main-content ${!sidePanelOpen ? 'panel-closed' : ''}`}>
        <div className="editor-wrapper">
          {title && <h1 className="editor-title">{title}</h1>}
          {subtitle && <p className="editor-subtitle">{subtitle}</p>}
          
          {toolbar}

          {children}
        </div>
      </main>

      <SidePanel
        open={sidePanelOpen}
        collapseLabel={collapseLabel}
        expandLabel={expandLabel}
        wide={wideSidePanel}
        onToggle={onToggleSidePanel}
        editorId={editorId}
      >
        {sidePanelContent}
      </SidePanel>
    </div>
  );
}

export default EditorLayout;
