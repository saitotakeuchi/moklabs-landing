"use client";

import posthog from "posthog-js";
import { flattenAttribution, getAttribution } from "@/lib/attribution";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Props {
  message: string;
  placement: string;
  children: React.ReactNode;
  className?: string;
}

const WhatsAppLink = ({ message, placement, children, className }: Props) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const attribution = getAttribution();
    const source = attribution.last?.utm_source;
    const finalMessage = source ? `${message} (via ${source})` : message;
    const url = buildWhatsAppUrl(finalMessage);

    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture("whatsapp_click", {
        placement,
        page: window.location.pathname,
        ...flattenAttribution(attribution),
      });
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <a href="#" onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default WhatsAppLink;
