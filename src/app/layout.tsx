import "./globals.css";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head />
      <body className="relative flex h-full flex-col bg-grey-light dark:bg-grey-dark">
        <Providers>
          <Header />
          <main className="flex h-full flex-grow flex-col overflow-hidden">
            {children}
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
