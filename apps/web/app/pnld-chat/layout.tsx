import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNLD Chat - Mok Labs",
  description: "PNLD Chat Application",
};

export default function PNLDChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="pnld-chat-app">{children}</div>;
}
