import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GCode Fixer",
  description: "A polished G-code cleanup and scan utility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-midnight-abyss text-ghost-white">
        {children}
      </body>
    </html>
  );
}
