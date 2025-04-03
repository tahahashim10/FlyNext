import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CookiePolicyModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check if user has already consented to cookies
    const cookieConsent = localStorage.getItem('flynext-cookie-consent');
    if (!cookieConsent) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('flynext-cookie-consent', 'true');
    setHasConsented(true);
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('flynext-cookie-consent', 'false');
    setHasConsented(false);
    setIsVisible(false);
  };

  if (hasConsented || !isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 right-0 m-6 z-50 
        transition-all duration-300 transform 
        bg-card shadow-2xl border border-border 
        rounded-xl max-w-md p-6"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-muted hover:text-primary"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center mb-4">
        <Cookie className="text-primary mr-3 h-8 w-8" />
        <h2 className="text-xl font-bold">Cookie Policy</h2>
      </div>

      <p className="text-muted text-sm mb-4">
        We use cookies to enhance your browsing experience, analyze site traffic, 
        and personalize content. By clicking "Accept", you consent to our use of cookies.
      </p>

      <div className="flex space-x-4">
        <button 
          onClick={handleAccept}
          className="flex-1 btn-primary py-2 rounded-md"
        >
          Accept All Cookies
        </button>
        <button 
          onClick={handleReject}
          className="flex-1 btn-outline py-2 rounded-md"
        >
          Reject Optional Cookies
        </button>
      </div>
    </div>
  );
};

export default CookiePolicyModal;