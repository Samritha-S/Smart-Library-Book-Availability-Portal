/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1120px',
      },
    },
    extend: {
      colors: {
        // EXACT required semantic tokens
        ink: {
          DEFAULT: '#042f2e',
          50: '#f0fdfa',
          100: '#ccfbf1',
          900: '#042f2e',
        },
        brand: {
          DEFAULT: '#0f766e',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#042f2e',
        },
        accent: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        accentink: {
          DEFAULT: '#b45309',
        },
        alert: {
          DEFAULT: '#b91c1c',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
        },
        paper: {
          DEFAULT: '#f7faf9',
          pure: '#ffffff',
          card: '#ffffff',
        },
        rule: {
          DEFAULT: '#d6e2e0',
          light: '#e8eeed',
          dark: '#b0c2bf',
        },
        grey: {
          DEFAULT: '#64748b',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
        },

        // Shadcn UI compatibility bridges
        border: '#d6e2e0',
        input: '#d6e2e0',
        ring: '#0f766e',
        background: '#f7faf9',
        foreground: '#042f2e',
        primary: {
          DEFAULT: '#0f766e',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#e8eeed',
          foreground: '#042f2e',
        },
        destructive: {
          DEFAULT: '#b91c1c',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#e8eeed',
          foreground: '#64748b',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#042f2e',
        },
      },
      fontFamily: {
        serif: ['"Newsreader Variable"', 'Newsreader', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Geist Variable"', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        heading: ['"Newsreader Variable"', 'Newsreader', 'ui-serif', 'Georgia', 'serif'],
        book: ['"Newsreader Variable"', 'Newsreader', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        control: '6px',
        lg: '12px',
        xl: '12px',
        sheet: '12px',
        dialog: '12px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(4, 47, 46, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(4, 47, 46, 0.06)',
        dialog: '0 4px 24px -2px rgba(4, 47, 46, 0.12)',
        sheet: '0 -4px 24px -2px rgba(4, 47, 46, 0.12)',
      },
    },
  },
  plugins: [],
};
