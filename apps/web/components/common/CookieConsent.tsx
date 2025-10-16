"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem("cookieConsent");
    if (!hasAcceptedCookies) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Save consent to localStorage
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50 transform transition-transform duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-gray-700 text-sm leading-relaxed">
            Usamos cookies para melhorar sua experiência em nosso site. Ao
            continuar, você concorda com nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="text-mok-blue hover:text-mok-blue/80 underline transition-colors"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="bg-mok-blue text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-mok-blue/90 transition-colors whitespace-nowrap"
        >
          Ok, entendi
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
