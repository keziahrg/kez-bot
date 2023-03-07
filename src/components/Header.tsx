import { ReactNode } from 'react'

interface HeaderProps {
    children: ReactNode
}

export const Header = ({ children }: HeaderProps) => (
    <header className="sticky top-0 right-0 left-0 z-10 bg-white bg-opacity-60 font-bold text-black backdrop-blur-md dark:bg-black dark:bg-opacity-60 dark:text-white">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4 ">
            {children}
        </div>
    </header>
)
