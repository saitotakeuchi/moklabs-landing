/**
 * NetworkStatus Component
 *
 * Displays a notification when the user loses internet connection
 */

"use client";

import { useState, useEffect } from "react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initialize with current online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Keep wasOffline true briefly to show "back online" message
      if (wasOffline) {
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  // Don't show anything if online and was never offline
  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50
                  transition-all duration-300 ease-in-out
                  ${isOnline && wasOffline ? "animate-slide-down" : ""}`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
                    ${
                      isOnline
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
      >
        {isOnline ? (
          <>
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">Conexão restaurada</p>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 flex-shrink-0 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <div>
              <p className="text-sm font-medium">Sem conexão com a internet</p>
              <p className="text-xs opacity-90 mt-0.5">
                Verifique sua conexão e tente novamente
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
