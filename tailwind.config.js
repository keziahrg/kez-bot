/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        colors: {
            white: '#FFFFFF',
            blue: '#A8E5FF',
            black: '#000211',
            purple: '#D2A8FF',
            'grey-light': '#F1F1F1',
            'grey-dark': '#252429',
        },
        extend: {
            keyframes: {
                ellipsis: {
                    '0%': { width: '0ch' },
                    '33%': { width: '1ch' },
                    '66%': { width: '2ch' },
                    '99%': { width: '3ch' },
                },
            },
            animation: {
                ellipsis: 'ellipsis 1.5s linear infinite',
            },
        },
    },
    plugins: [],
}
