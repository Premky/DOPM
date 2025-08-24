import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { BaseURLProvider } from './Context/BaseURLProvider.jsx';
import { HelmetProvider } from 'react-helmet-async';

createRoot( document.getElementById( 'root' ) ).render(
  <StrictMode>
    <BaseURLProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BaseURLProvider>
  </StrictMode>,
);
