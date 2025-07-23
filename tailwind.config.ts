import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
          DEFAULT: "0 84.2% 60.2%",
          foreground: "210 40% 98%",
        },
        muted: {
          DEFAULT: "210 40% 96.1%",
          foreground: "215.4 16.3% 46.9%",
        },
        accent: {
          DEFAULT: "210 40% 96.1%",
          foreground: "222.2 47.4% 11.2%",
        },
        popover: {
          DEFAULT: "0 0% 100%",
          foreground: "222.2 84% 4.9%",
        },
        card: {
          DEFAULT: "0 0% 100%",
          foreground: "222.2 84% 4.9%",
        },
        // Samoo CI Colors (from https://www.samoo.com/home/about/ci.do)
        "samoo-blue": {
          DEFAULT: "#0047AB", // Primary Blue
          light: "#6699CC", // Secondary Blue
          dark: "#003380", // Darker for active states
        },
        "samoo-gray": {
          DEFAULT: "#333333", // Dark text
          medium: "#666666", // Subtler text, borders
          light: "#F0F0F0", // Backgrounds
          "button-default": "#E8E8E8", // Slightly darker for inactive toggles
          "button-hover": "#E0E0E0", // Even darker for inactive toggle hover
        },
        // Discipline-specific light colors for tables (removed 'dark' variants for buttons)
        "discipline-arch": {
          DEFAULT: "#E6F0FF", // Light blue
        },
        "discipline-elec": {
          DEFAULT: "#E6FFE6", // Light green
        },
        "discipline-piping": {
          DEFAULT: "#FFE6E6", // Light red
        },
        "discipline-civil": {
          DEFAULT: "#FFFFE6", // Light yellow
        },
        "discipline-ic": {
          DEFAULT: "#F0E6FF", // Light purple
        },
        "discipline-fp": {
          DEFAULT: "#FFEFD5", // Light orange
        },
        "discipline-hvac": {
          DEFAULT: "#E6FFFF", // Light cyan
        },
        "discipline-struct": {
          DEFAULT: "#F0F8FF", // Light indigo
        },
        "discipline-cell": {
          DEFAULT: "#FFD700", // Gold-like color for Cell/Battery
        },
        "discipline-general": {
          DEFAULT: "#F5F5F5", // Light gray for General
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
