/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '24px', // From README: padding 24px
      screens: {
        '2xl': '700px', // According to the design specs, max container width is 700px
      },
    },
    extend: {
      colors: {
        // Colors from the README design system
        primary: {
          DEFAULT: '#06545E', // Deep teal - for buttons, links, and interactive elements
          hover: '#E6F0F2', // Button hover state
        },
        secondary: {
          DEFAULT: '#1F2A44', // Near-black - for main text
        },
        gray: {
          DEFAULT: '#6B7280', // Secondary text
          light: '#E5E7EB', // Light gray - for borders
        },
        slate: {
          50: '#F8FAFC', // Full-width background
        },
        border: {
          DEFAULT: '#E5E7EB', // Default border color
          focus: '#06545E', // Focused element border
        },
        background: {
          DEFAULT: '#FFFFFF', // White background for containers
        },
      },
      fontFamily: {
        // Manrope font from design specs
        sans: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        // From README: Heading 24px, section headings 16px, body text 14px
        heading: '24px',
        section: '16px',
        body: '14px',
      },
      borderRadius: {
        // From README: rounded 8px for elements, and rounded-2xl from layout specs
        DEFAULT: '8px',
        '2xl': '1rem',
      },
      spacing: {
        // From README: Vertical 24px/16px, horizontal 8px/16px
        'vertical-lg': '24px',
        'vertical': '16px',
        'horizontal-lg': '16px',
        'horizontal': '8px',
      },
      height: {
        // From README: Inputs 48px, buttons 40px
        'input': '48px',
        'button': '40px',
      },
      padding: {
        'input': '12px', // Input padding from README
        'button': '8px', // Button padding from README
        'question': '16px', // Question container padding from README
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')],
}
