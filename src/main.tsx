import 'core-js/proposals/array-buffer-base64';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';
import { App } from './App';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
