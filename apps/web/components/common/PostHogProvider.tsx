"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { siteConfig } from "@/config/site";

const hasConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem("cookieConsent");
  return stored === "true" || stored === "accepted";
};

const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (!siteConfig.features.analytics) return;

    const key = siteConfig.analytics.posthogKey;
    if (!key) return;

    if (posthog.__loaded) return;

    posthog.init(key, {
      api_host: siteConfig.analytics.posthogHost,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      persistence: hasConsent() ? "localStorage+cookie" : "memory",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug(false);
        }
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
};

export default PostHogProvider;
