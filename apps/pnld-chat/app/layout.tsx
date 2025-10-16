import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNLD Chat - Mok Labs",
  description: "PNLD Chat Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
