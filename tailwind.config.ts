import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#1E40AF',
          foreground: '#FFFFFF',
          light: '#3B82F6',
        },
        success: {
          DEFAULT: '#059669',
          foreground: '#FFFFFF',
          light: '#10B981',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D97706',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // shadcn/ui required colors - fixes dropdown transparency
        background: '#FFFFFF',
        foreground: '#111827',
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F3F4F6',
          foreground: '#111827',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#1E40AF',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        secondary: {
          DEFAULT: '#F3F4F6',
          foreground: '#111827',
        },
      },
    },
  },
  plugins: [],
};

export default config;
