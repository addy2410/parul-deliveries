
import { createRoot } from 'react-dom/client'
import React from 'react';
import './index.css'
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Lazy load the main App component
const App = React.lazy(() => import('./App.tsx'));
const InstallPWAPrompt = React.lazy(() => import('./components/InstallPWAPrompt'));

createRoot(document.getElementById("root")!).render(
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
