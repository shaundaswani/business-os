import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core design tokens
        'os-bg': '#F8FAFC',
        'os-text': '#0F172A',
        'os-text-secondary': '#64748B',
        'os-muted': '#94A3B8',
        'os-border': '#E2E8F0',
        'os-card': '#FFFFFF',
        'os-tile': '#F8FAFC',
        'os-win': '#16A34A',
        'os-loss': '#DC2626',
        'os-amber': '#D97706',
        // Status banners
        'os-info-bg': '#F0F9FF',
        'os-info-border': '#BAE6FD',
        'os-info-text': '#0369A1',
        'os-alert-bg': '#FFFBEB',
        'os-alert-border': '#FDE68A',
        'os-alert-text': '#92400E',
        'os-danger-bg': '#FEF2F2',
        'os-danger-border': '#FECACA',
        'os-danger-text': '#991B1B',
        // Module colours
        'mod-overview': '#0F172A',
        'mod-trading': '#7C3AED',
        'mod-jetset': '#0891B2',
        'mod-commercial': '#6366F1',
        'mod-exaim': '#DC2626',
        'mod-improveme': '#059669',
        'mod-residential': '#2563EB',
        'mod-personal': '#818CF8',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'featured': '14px',
      },
    },
  },
  plugins: [],
}

export default config
