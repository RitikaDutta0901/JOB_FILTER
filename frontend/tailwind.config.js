/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          card: '#151D30',
          border: '#232E4A',
          primary: '#6366F1', // Indigo
          secondary: '#14B8A6', // Teal
          hover: '#4F46E5',
          accent: '#A855F7', // Purple
        },
        status: {
          applied: '#3B82F6', // Blue
          shortlisted: '#8B5CF6', // Purple
          oa: '#F59E0B', // Amber
          interview: '#EC4899', // Pink
          offer: '#10B981', // Emerald
          rejected: '#EF4444', // Red
          withdrawn: '#6B7280', // Gray
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
