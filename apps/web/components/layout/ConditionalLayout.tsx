"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/sections";
import { ReactNode } from "react";

interface ConditionalLayoutProps {
  children: ReactNode;
}

/**
 * ConditionalLayout component that conditionally renders the default Header and Footer
 * based on the current pathname. Some routes (like /pnld-chat) need their own
 * custom header/footer and should skip the default ones.
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Routes that should NOT have the default header/footer
  const standaloneRoutes = ["/pnld-chat"];
  const isStandalonePage = standaloneRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Standalone pages render children only (no default header/footer)
  if (isStandalonePage) {
    return <>{children}</>;
  }

  // Regular pages get the default header, padding, and footer
  return (
    <div className="pt-[60px] sm:pt-[84px] md:pt-[98px]">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
