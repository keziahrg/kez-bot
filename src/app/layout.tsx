import './globals.css'
import { Header } from '@/components/Header'
import { ThemeContextProvider } from '@/context/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Html } from '@/components/Html'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeContextProvider>
            <Html>
                <head />
                <body className="flex h-full flex-col bg-grey-light dark:bg-grey-dark">
                    <Header>
                        <h1>KezBot</h1>
                        <ThemeToggle />
                    </Header>
                    <main className="flex h-full flex-col">{children}</main>
                </body>
            </Html>
        </ThemeContextProvider>
    )
}
