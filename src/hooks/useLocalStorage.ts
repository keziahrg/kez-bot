import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, fallbackValue: T) {
    const [value, setValue] = useState<T>(() => {
        const storedValue = localStorage.getItem(key)
        return storedValue ? JSON.parse(storedValue) : fallbackValue
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue] as const
}
