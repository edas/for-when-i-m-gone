import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Icon } from './Icons';
import './SidePanel.css';

interface SidePanelProps {
  open: boolean;
  collapseLabel: string;
  expandLabel: string;
  wide?: boolean;
  onToggle: () => void;
  children: ReactNode;
  editorId?: string;
}

export function SidePanel({ 
  open, 
  collapseLabel, 
  expandLabel, 
  wide = false, 
  onToggle, 
  children, 
  editorId = 'default' 
}: SidePanelProps) {
  const STORAGE_KEY = `sidePanel_hasVisitedSmallScreen_${editorId}`;
  
  const getInitialHasVisitedSmallScreen = (): boolean => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  };
  
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [hasVisitedSmallScreen, setHasVisitedSmallScreen] = useState(getInitialHasVisitedSmallScreen);
  
  const checkScreenSize = useCallback(() => {
    const newIsLargeScreen = window.innerWidth > 900;
    
    setIsLargeScreen(prev => {
      // Detect transition from large screen to small screen
      if (prev && !newIsLargeScreen && !hasVisitedSmallScreen && !open) {
        setHasVisitedSmallScreen(true);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEY, 'true');
        }
        onToggle();
      }
      return newIsLargeScreen;
    });
  }, [hasVisitedSmallScreen, open, onToggle, STORAGE_KEY]);
  
  useEffect(() => {
    setIsLargeScreen(window.innerWidth > 900);
    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [checkScreenSize]);
  
  const handleToggle = () => {
    // Don't allow collapsing on large screens
    if (isLargeScreen && open) {
      return;
    }
    onToggle();
  };

  const classNames = [
    'side-panel',
    !open && 'closed',
    wide && 'wide',
    isLargeScreen && 'large-screen',
  ].filter(Boolean).join(' ');

  return (
    <aside className={classNames}>
      <button 
        className="toggle-button" 
        onClick={handleToggle}
        disabled={isLargeScreen && open}
        aria-disabled={isLargeScreen && open}
      >
        {open ? (
          <>
            <Icon name="chevron-right" />
            <span className="toggle-text">{collapseLabel}</span>
          </>
        ) : (
          <>
            <Icon name="chevron-left" />
            <span className="toggle-text">{expandLabel}</span>
          </>
        )}
      </button>

      {open && (
        <div className="panel-content">
          {children}
        </div>
      )}
    </aside>
  );
}

export default SidePanel;
