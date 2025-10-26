import type { Metadata } from "next";
import { NetworkStatus } from "@/components/ui";

export const metadata: Metadata = {
  title: "PNLD Chat - Mok Labs",
  description: "PNLD Chat Application",
};

export default function PNLDChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="pnld-chat-app min-h-screen w-full overflow-hidden font-inter">
      <NetworkStatus />
      {children}
    </div>
  );
}
