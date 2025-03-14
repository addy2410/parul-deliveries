
import { createRoot } from 'react-dom/client'
import React from 'react';
import './index.css'
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Performance optimization: set initial loading state to prevent layout shifts
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = `
    <div class="min-h-screen flex items-center justify-center">
      <div class="animate-pulse h-20 w-32 bg-gray-100 rounded-md"></div>
    </div>
  `;
}

// Lazy load the main App component with priority
const App = React.lazy(() => import('./App.tsx'));
const InstallPWAPrompt = React.lazy(() => 
  Promise.all([
    // Delay non-critical components
    new Promise(resolve => setTimeout(resolve, 1000)),
    import('./components/InstallPWAPrompt')
  ]).then(([_, module]) => module)
);

// Register service worker with performance improvements
if ('serviceWorker' in navigator) {
  // Defer service worker registration to improve page load performance
  window.addEventListener('load', () => {
    // Use setTimeout to defer non-critical operations
    setTimeout(() => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    }, 2000); // Delay service worker registration by 2 seconds
  });
}

// Optimized hydration with error recovery
const hydrateApp = () => {
  try {
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-pulse h-20 w-32 bg-gray-100 rounded-md"></div>
            </div>
          }>
            <App />
            <InstallPWAPrompt />
            <Toaster />
            <Sonner />
          </Suspense>
        </React.StrictMode>
      );
    }
  } catch (error) {
    console.error('Error during app hydration:', error);
    // Attempt recovery
    setTimeout(hydrateApp, 1000);
  }
};

// Use requestIdleCallback for non-critical UI rendering if available
if ('requestIdleCallback' in window) {
  requestIdleCallback(hydrateApp);
} else {
  // Fallback if requestIdleCallback is not available
  setTimeout(hydrateApp, 1);
}
