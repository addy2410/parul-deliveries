import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

const InstallPWAPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // Check if this is a PWA already
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if we've already prompted using localStorage
    const hasAlreadyPrompted = localStorage.getItem('pwaPromptShown');
    
    // Check if device is iOS - using a type-safe approach
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    
    if (!isPWA && !hasAlreadyPrompted && !hasPrompted) {
      // Only show prompt on mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Set a timeout to show the prompt after 5 seconds
        const timer = setTimeout(() => {
          setIsOpen(true);
          setHasPrompted(true);
          // Set localStorage to prevent showing again for a week
          localStorage.setItem('pwaPromptShown', Date.now().toString());
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [hasPrompted]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <img 
              src="/lovable-uploads/5c6eb016-a0ad-449a-bcdf-0d53631b9e62.png" 
              alt="CampusGrub Logo" 
              className="w-8 h-8" 
            />
            Save CampusGrub to Home Screen
          </DialogTitle>
          <DialogDescription>
            Get faster access to your favorite campus food!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
            <img 
              src="/lovable-uploads/5c6eb016-a0ad-449a-bcdf-0d53631b9e62.png"
              alt="CampusGrub App Icon"
              className="w-24 h-24 mb-3"
            />
            <p className="text-sm text-center text-gray-700">
              {isIOS ? (
                <>
                  Tap <span className="inline-flex items-center mx-1 px-2 py-1 bg-gray-200 rounded text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share
                  </span> then "Add to Home Screen"
                </>
              ) : (
                <>
                  Tap <span className="inline-flex items-center mx-1 px-2 py-1 bg-gray-200 rounded text-xs">︙</span> 
                  then "Add to Home Screen"
                </>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
              <li>Faster access to restaurants</li>
              <li>Works offline</li>
              <li>App-like experience</li>
              <li>Easy order tracking</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleClose} 
            variant="outline" 
            className="mr-2"
          >
            Maybe Later
          </Button>
          <Button 
            onClick={handleClose}
            className="bg-[#ea384c] hover:bg-[#d02e40] text-white"
          >
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPWAPrompt;
