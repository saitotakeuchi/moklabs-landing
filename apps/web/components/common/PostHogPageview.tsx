"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const PageviewTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;

    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
};

const PostHogPageview = () => (
  <Suspense fallback={null}>
    <PageviewTracker />
  </Suspense>
);

export default PostHogPageview;
