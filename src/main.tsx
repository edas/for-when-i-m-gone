import 'core-js/proposals/array-buffer-base64';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/i18n'; // Initialize i18next
import { App } from './App';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
