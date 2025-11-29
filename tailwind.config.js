/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4285F4', // Google Blue
                secondary: '#FFFFFF', // White
                accent: '#E8F0FE', // Light Blue
                dark: '#174EA6', // Darker Blue for contrast
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Syne', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
