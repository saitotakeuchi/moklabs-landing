"use client";

import { useEffect, useState } from "react";
import WhatsAppLink from "./WhatsAppLink";

const STORAGE_KEY = "cookieConsent";
const CONSENT_EVENT = "cookieConsentAccepted";

const StickyWhatsAppButton = () => {
  const [consentAccepted, setConsentAccepted] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setConsentAccepted(localStorage.getItem(STORAGE_KEY) === "true");
    const handler = () => setConsentAccepted(true);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  return (
    <div
      className={`fixed right-4 z-50 sm:hidden transition-[bottom] duration-300 ${
        consentAccepted ? "bottom-4" : "bottom-24"
      }`}
    >
      <WhatsAppLink
        message="Olá! Vim do site da Mok Labs."
        placement="mobile-sticky"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#1ebc58] transition-colors font-bold"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="currentColor"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.15 1.6 5.96L2 22l4.27-1.12a9.9 9.9 0 0 0 5.76 1.83h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.13-2.9-7-1.87-1.87-4.36-2.9-7-2.9Zm0 18.12h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.53.66.67-2.46-.19-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 5.83 2.41 8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24Zm4.52-6.16c-.24-.12-1.46-.72-1.68-.8-.22-.08-.38-.12-.54.13-.16.24-.62.8-.76.96-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.97-1.22-.73-.65-1.22-1.46-1.36-1.7-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.59 4.11 3.63.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28Z" />
        </svg>
        Fale conosco
      </WhatsAppLink>
    </div>
  );
};

export default StickyWhatsAppButton;
