"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import type { SectionName } from "@/lib/posthog/sections";

interface Props {
  section: SectionName;
  children: React.ReactNode;
}

const SectionTracker = ({ section, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!fired && entry.intersectionRatio >= 0.5) {
            fired = true;
            if (typeof window !== "undefined" && posthog.__loaded) {
              posthog.capture("section_viewed", {
                section,
                page: window.location.pathname,
              });
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [section]);

  return <div ref={ref}>{children}</div>;
};

export default SectionTracker;
