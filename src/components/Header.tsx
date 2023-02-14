import { ReactNode } from 'react'

interface HeaderProps {
    children: ReactNode | ReactNode[]
}

export const Header = ({ children }: HeaderProps) => {
    return (
        <header className="flex items-center justify-between bg-white px-4 py-4 font-bold text-black dark:bg-black dark:text-white">
            {children}
        </header>
    )
}
