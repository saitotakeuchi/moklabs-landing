import { useEffect } from 'react';

const GoogleAnalytics = () => {
  const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

  useEffect(() => {
    // Only load Google Analytics in production and if tracking ID is provided
    if (!GA_TRACKING_ID || import.meta.env.DEV) {
      console.log('Google Analytics: Skipped in development environment');
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_title: document.title,
        page_location: window.location.href,
      });
    `;
    document.head.appendChild(script2);

    // Make gtag available globally
    window.gtag = window.gtag || function() {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(arguments);
    };

    console.log('Google Analytics initialized with ID:', GA_TRACKING_ID);

    // Cleanup function
    return () => {
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
      if (script2.parentNode) {
        script2.parentNode.removeChild(script2);
      }
    };
  }, [GA_TRACKING_ID]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;