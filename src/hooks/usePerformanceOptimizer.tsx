
import { useEffect, useState, useCallback } from 'react';

/**
 * A hook to implement various performance optimizations throughout the application
 */
export const usePerformanceOptimizer = (options = {}) => {
  const [resourceHints, setResourceHints] = useState<boolean>(false);
  
  // Set up performance optimization techniques
  useEffect(() => {
    // Only run in production and in the browser
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;
    
    // Add resource hints for better performance
    const addResourceHints = () => {
      if (resourceHints) return;
      
      // Preconnect to important domains
      const domains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ];
      
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
      
      setResourceHints(true);
    };
    
    // Enable image lazy loading
    const setupLazyLoading = () => {
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
    };
    
    // Optimize runtime performance
    const optimizeRuntime = () => {
      // Disable console in production
      if (process.env.NODE_ENV === 'production') {
        console.log = () => {};
        console.debug = () => {};
      }
    };
    
    // Monitor for layout shifts
    const monitorLayoutShifts = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              // Use type assertion to correctly type the LayoutShift entry
              const layoutShift = entry as unknown as {
                hadRecentInput: boolean;
                value: number;
              };
              
              if (layoutShift.hadRecentInput) continue;
              
              // Log significant layout shifts (CLS > 0.1)
              if (layoutShift.value > 0.1) {
                console.warn('Significant layout shift detected:', entry);
              }
            }
          });
          
          observer.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          console.error('Layout shift monitoring failed:', e);
        }
      }
    };
    
    // Defer non-critical CSS
    const deferNonCriticalCSS = () => {
      const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
      styleSheets.forEach(sheet => {
        if (sheet.getAttribute('href')?.includes('non-critical')) {
          sheet.setAttribute('media', 'print');
          sheet.setAttribute('onload', "this.media='all'");
        }
      });
    };
    
    // Run optimizations
    addResourceHints();
    setupLazyLoading();
    optimizeRuntime();
    monitorLayoutShifts();
    deferNonCriticalCSS();
    
    // Set up mutation observer to apply optimizations to new elements
    const observer = new MutationObserver((mutations) => {
      setupLazyLoading();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, [resourceHints]);
  
  // Function to optimize images on the page
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }, []);
  
  return {
    optimizeImages,
  };
};

export default usePerformanceOptimizer;
