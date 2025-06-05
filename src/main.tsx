
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { createLogger } from './utils/logger';

const logger = createLogger('main');

// Explicitly assign React to window to prevent "React refresh preamble not loaded" errors
if (typeof window !== 'undefined') {
  window.React = React;
}

// Register service worker for offline support with improved error handling
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        logger.info('Attempting to register service worker...');
        // Only try to register in production to avoid development conflicts
        if (process.env.NODE_ENV === 'production') {
          const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
            updateViaCache: 'none' // Prevent browser cache from interfering
          });
          logger.info('Service Worker registered with scope:', registration.scope);
        } else {
          logger.debug('Service Worker registration skipped in development mode');
        }
      } catch (error) {
        logger.error('Service Worker registration failed:', error);
        // Don't block the app from loading if service worker fails
      }
    });
  }
};

// Import the OfflineIndicator component
import OfflineIndicator from '@/components/ui/OfflineIndicator';

// Use a more robust root mounting approach with better error handling
const mount = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      logger.error('Root element not found, waiting for DOM');
      setTimeout(mount, 100); // Retry after a delay
      return;
    }

    logger.info("Mounting React application");
    
    // Force a style reset on the root element
    rootElement.style.cssText = "width: 100%; height: 100%; min-height: 100vh; background-color: hsl(var(--background, 180 25% 98%));";
    
    const root = ReactDOM.createRoot(rootElement);

    // Render without error boundary at root to avoid React context issues
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Register service worker after React has mounted
    setTimeout(() => registerServiceWorker(), 1000);
    
  } catch (error) {
    logger.error("Error mounting React application:", error);
    // Display a useful error message
    document.body.innerHTML = '<div style="color:red;padding:20px;">Failed to load application. Please refresh the page.</div>';
  }
};

// Ensure React is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
