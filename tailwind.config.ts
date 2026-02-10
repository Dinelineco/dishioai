import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'void': '#050505',
                'gunmetal': '#171717',
                'charcoal': '#262626',
                'warning-yellow': '#FACC15',
                'rebellion-red': '#B91C1C', // Brighter, more vibrant red
                'rebellion-accent': '#991B1B', // Deep red accent
                'saffron-gold': '#EAB308', // Brighter gold
                'matte-black': '#1F1F1F', // Lighter black for better readability
                'cream': '#F5F5F4', // Cream for text/accents
            },
            fontFamily: {
                'display': ['Playfair Display', 'serif'],
                'serif': ['Crimson Text', 'serif'],
            },
            boxShadow: {
                'crave-glow': '0 0 50px -12px rgba(250, 204, 21, 0.15)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 1s ease-in-out',
                'slide-up': 'slideUp 0.8s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
