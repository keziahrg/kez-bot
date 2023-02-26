import './globals.css'
import { Header } from '@/components/Header'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ServerThemeProvider } from 'next-themes'
import { ThemeProvider } from 'next-themes'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ServerThemeProvider attribute="class">
            <html lang="en" className="h-full">
                <head />
                <body className="flex h-full flex-col bg-grey-light dark:bg-grey-dark">
                    <ThemeProvider attribute="class">
                        <Header>
                            <h1>KezBot</h1>
                            <ThemeToggle />
                        </Header>
                    </ThemeProvider>
                    <main className="flex h-full flex-grow flex-col overflow-hidden">
                        {children}
                    </main>
                </body>
            </html>
        </ServerThemeProvider>
    )
}
