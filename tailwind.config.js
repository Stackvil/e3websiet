/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'sunset-orange': '#FF5733',
                'riverside-teal': '#008080',
                'charcoal-grey': '#333333',
                'creamy-white': '#F9F9F9',
                'accent-teal': '#00A8A8',
            },
            fontFamily: {
                'heading': ['Montserrat', 'sans-serif'],
                'body': ['Open Sans', 'sans-serif'],
            },
            gridTemplateColumns: {
                '12': 'repeat(12, minmax(0, 1fr))',
            }
        },
    },
    plugins: [],
}
