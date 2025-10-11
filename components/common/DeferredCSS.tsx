"use client";

import { useEffect } from "react";

export function DeferredCSS() {
  useEffect(() => {
    // Find all stylesheet links
    const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');

    styleSheets.forEach((link) => {
      const linkElement = link as HTMLLinkElement;

      // Skip if already processed or is a font
      if (linkElement.dataset.deferred || linkElement.href.includes("fonts")) {
        return;
      }

      // Create a new link element with deferred loading
      const newLink = document.createElement("link");
      newLink.rel = "preload";
      newLink.as = "style";
      newLink.href = linkElement.href;
      newLink.onload = () => {
        newLink.onload = null;
        newLink.rel = "stylesheet";
      };

      // Mark as processed
      newLink.dataset.deferred = "true";

      // Insert the new link before the old one
      linkElement.parentNode?.insertBefore(newLink, linkElement);

      // Remove the old blocking link after a short delay
      setTimeout(() => {
        linkElement.remove();
      }, 100);
    });
  }, []);

  return null;
}
