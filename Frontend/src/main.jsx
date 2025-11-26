import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { BaseURLProvider } from './Context/BaseURLProvider.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider  } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.js';

createRoot( document.getElementById( 'root' ) ).render(
  <StrictMode>
    <BaseURLProvider>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
     
          <App />

        </ThemeProvider>
      </HelmetProvider>
    </BaseURLProvider>
  </StrictMode>,
);
