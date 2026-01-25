import { ReactNode } from 'react';
import styles from './Overlay.module.css';

interface OverlayProps {
  children: ReactNode;
}

export function Overlay({ children }: OverlayProps) {
  return (
    <div className={styles.overlay}>
      {children}
    </div>
  );
}

export default Overlay;
