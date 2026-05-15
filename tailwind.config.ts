import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        warning: "var(--warning)",
        bg: "var(--background)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        borderSoft: "var(--border)"
      },
      borderRadius: {
        card: "16px",
        button: "12px"
      },
      boxShadow: {
        card: "0 8px 24px var(--shadow)"
      },
      fontFamily: {
        mali: ["Mali", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;