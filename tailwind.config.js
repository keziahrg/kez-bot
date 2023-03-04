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
            pink: '#FFA8D2',
            'grey-light': '#F1F1F1',
            'grey-dark': '#252429',
        },
        extend: {
            keyframes: {
                'dot-1': {
                    '0%': { scale: '0' },
                    '33%': { scale: '1' },
                    '66%': { scale: '1' },
                    '99%': { scale: '1' },
                },
                'dot-2': {
                    '0%': { scale: '0' },
                    '33%': { scale: '0' },
                    '66%': { scale: '1' },
                    '99%': { scale: '1' },
                },
                'dot-3': {
                    '0%': { scale: '0' },
                    '33%': { scale: '0' },
                    '66%': { scale: '0' },
                    '99%': { scale: '1' },
                },
            },
            animation: {
                'dot-1': 'dot-1 1s linear infinite',
                'dot-2': 'dot-2 1s linear infinite',
                'dot-3': 'dot-3 1s linear infinite',
            },
        },
    },
    plugins: [],
}
