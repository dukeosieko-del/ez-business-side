import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Janjez Business Side",
  description: "Launch your own white-label SMM panel. Powered by Janjez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
