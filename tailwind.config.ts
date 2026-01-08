import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clash Royale inspired color palette
        primary: {
          DEFAULT: "#5B8DEE", // CR Blue
          light: "#7AA5F2",
          dark: "#3D6BCF",
        },
        secondary: {
          DEFAULT: "#FFC043", // CR Gold
          light: "#FFD073",
          dark: "#E6A52E",
        },
        accent: {
          purple: "#A057D9", // Legendary purple
          orange: "#FF8C42", // Epic orange
          red: "#E74C3C", // Rare red
          green: "#4ADE80", // Common green
        },
        background: {
          DEFAULT: "#0a0e27", // Dark navy base
          card: "#141B3D", // Card background
          elevated: "#1A2347", // Elevated surfaces
        },
        foreground: {
          DEFAULT: "#EDEDED", // Primary text
          muted: "#94A3B8", // Secondary text
          dimmed: "#64748B", // Tertiary text
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-clash': 'linear-gradient(135deg, #0a0e27 0%, #141B3D 50%, #1A2347 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(91, 141, 238, 0.3), 0 4px 6px -2px rgba(91, 141, 238, 0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
