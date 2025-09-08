/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        medistacks: {
          light: '#F9F8EB',
          primary: '#A7D7C5',
          secondary: '#74B49B',
          dark: '#5C8D89',
        },
        medical: {
          50: '#f5f7ff',
          100: '#D4DCFF',
          200: '#b8c4ff',
          300: '#9ca8ff',
          400: '#8094ff',
          500: '#6480ff',
          600: '#4866ff',
          700: '#2c4cff',
          800: '#1032ff',
          900: '#0018f3',
        },
        dark: {
          50: '#1a1a1a',
          100: '#2d2d2d',
          200: '#404040',
          300: '#535353',
          400: '#666666',
          500: '#808080',
          600: '#999999',
          700: '#b3b3b3',
          800: '#cccccc',
          900: '#000000',
        },
        teal: {
          50: '#f0fffe',
          100: '#ccfffe',
          200: '#99fffd',
          300: '#66fffc',
          400: '#33fffb',
          500: '#0B7A75',
          600: '#096b66',
          700: '#075c57',
          800: '#054d48',
          900: '#033e39',
        },
        green: {
          50: '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4',
          300: '#68d391',
          400: '#48bb78',
          500: '#5ABF4A',
          600: '#38a169',
          700: '#2f855a',
          800: '#276749',
          900: '#22543d',
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#96E072',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#365314',
          900: '#1a2e05',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(167, 215, 197, 0.5), 0 0 40px rgba(92, 141, 137, 0.3)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(167, 215, 197, 0.8), 0 0 60px rgba(116, 180, 155, 0.5)" 
          },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.1)" },
          "50%": { transform: "scale(1)" },
          "75%": { transform: "scale(1.05)" },
        },
        "medical-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "dna-spin": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "medical-float": "medical-float 3s ease-in-out infinite",
        "dna-spin": "dna-spin 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
