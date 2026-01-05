/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Added components just in case, though src usually covers it if structure is standard. Checking file view... components is inside src? No, checking list_dir might be good but let's assume standard Vite structure src/* which usually includes components. Wait, looking at previous file view: 'd:/downloads/شغل كافيه/موقع المنيو/components/Hero.tsx'. It seems 'components' is at ROOT?
        // Let me check file paths from previous turns.
        // 'd:/downloads/شغل كافيه/موقع المنيو/App.tsx' is at root?
        // 'd:/downloads/شغل كافيه/موقع المنيو/components/Hero.tsx'
        // 'd:/downloads/شغل كافيه/موقع المنيو/index.tsx'
        // So source files are in root and ./components.
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Tajawal', 'sans-serif'],
            },
            colors: {
                luxury: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',   /* Primary Purple */
                    800: '#5b21b6',   /* Darker Purple */
                    900: '#4c1d95',   /* Deepest Purple */
                    950: '#2e1065',   /* Almost Black Purple */
                },
                gold: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                }
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
            animation: {
                'blob': 'blob 7s infinite',
                'marquee': 'marquee 25s linear infinite',
            },
        },
    },
    plugins: [],
}
