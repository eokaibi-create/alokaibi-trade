import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OKAIBI — Global Trading",
  description: "Your trusted partner in global trade",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags will be set dynamically in [locale]/layout */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
