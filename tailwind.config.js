/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Blue Shiny Theme Colors
        'deep-blue': '#0F172A',      // Darkest blue background
        'dark-blue': '#1E293B',      // Dark blue for cards
        'medium-blue': '#334155',    // Medium blue for borders
        'light-blue': '#475569',     // Light blue for text
        'accent-blue': '#3B82F6',    // Bright blue for accents
        'electric-blue': '#06B6D4',  // Electric blue for highlights
        'neon-blue': '#0EA5E9',      // Neon blue for buttons
        'ice-blue': '#E0F2FE',       // Very light blue for text
        'silver': '#F1F5F9',         // Silver for primary text
        'charcoal': '#000000',       // Pure black for shadings only

        // Cosmic theme colors
        'space-navy': '#0B1426',     // Deep space navy
        'starlight-white': '#F8FAFC', // Bright starlight white
        'cosmic-purple': '#7C3AED',   // Deep cosmic purple
        'nebula-pink': '#EC4899',     // Nebula pink
        'stellar-blue': '#0EA5E9',    // Stellar blue
        'supernova-gold': '#F59E0B',  // Supernova gold
        'plasma-orange': '#F97316',   // Plasma orange

        // Legacy colors for compatibility
        primary: '#3B82F6',
        'primary-hover': '#2563EB',
        secondary: '#475569',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      spacing: {
        section: '2rem',
      },
      borderRadius: {
        container: '0.75rem',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'float': 'float 15s ease-in-out infinite',
        'slow-spin': 'slow-spin 60s linear infinite',
        'slow-spin-reverse': 'slow-spin-reverse 80s linear infinite',
        'shooting-star': 'shooting-star 3s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-10px) translateX(5px)' },
          '50%': { transform: 'translateY(-5px) translateX(-5px)' },
          '75%': { transform: 'translateY(-15px) translateX(3px)' },
        },
        'slow-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slow-spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'shooting-star': {
          '0%': {
            transform: 'translateX(0) translateY(0) scale(0)',
            opacity: '0',
          },
          '10%': {
            transform: 'translateX(10px) translateY(10px) scale(1)',
            opacity: '1',
          },
          '90%': {
            transform: 'translateX(300px) translateY(300px) scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(400px) translateY(400px) scale(0)',
            opacity: '0',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      touchAction: {
        'manipulation': 'manipulation',
      },
      minHeight: {
        'touch': '44px', // Minimum touch target size
      },
      minWidth: {
        'touch': '44px', // Minimum touch target size
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-lg': '0 0 40px rgba(245, 158, 11, 0.4)',
      },
    },
  },
  plugins: [],
}
