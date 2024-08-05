import "./globals.css";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KezBot",
  description:
    "A custom GPT-3.5-turbo chatbot that's ready to answer all your questions about me. Built with OpenAI, Vercel Postgres, PG Vector, Prisma, Next.js and Tailwind CSS 🤖",
  robots: {
    index: false,
    follow: false,
  },
  icons: "/favicon.svg",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
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
