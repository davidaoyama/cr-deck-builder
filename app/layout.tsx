import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CR Deck Builder",
  description: "Clash Royale Meta Deck Builder - Find decks you can build",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
