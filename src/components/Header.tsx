import { ReactNode } from 'react'

interface HeaderProps {
    children: ReactNode | ReactNode[]
}

export const Header = ({ children }: HeaderProps) => {
    return (
        <header className="bg-white font-bold text-black dark:bg-black dark:text-white">
            <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4 ">
                {children}
            </div>
        </header>
    )
}
