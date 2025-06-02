
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Brand colors
				brand: {
					DEFAULT: 'hsl(var(--brand-primary))',
					dark: 'hsl(var(--brand-primary-dark))',
					light: 'hsl(var(--brand-primary-light))',
					foreground: 'hsl(var(--brand-primary-foreground))'
				},
				// Status colors
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				// Sophisticated gray palette inspired by Attio
				gray: {
					25: '#fafafa',
					50: '#f8f9fa',
					100: '#f1f3f4',
					200: '#e8eaed',
					300: '#dadce0',
					400: '#9aa0a6',
					500: '#5f6368',
					600: '#3c4043',
					700: '#202124',
					800: '#171717',
					900: '#0d0d0d',
				},
				// Professional blue palette
				blue: {
					25: '#f8fbff',
					50: '#eff8ff',
					100: '#d1e9ff',
					200: '#b2ddff',
					300: '#84caff',
					400: '#53b1fd',
					500: '#2e90fa',
					600: '#1570ef',
					700: '#175cd3',
					800: '#1849a9',
					900: '#194185',
				},
				// Enhanced emerald palette
				emerald: {
					25: '#f6fef9',
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
				},
				// Professional amber palette
				amber: {
					25: '#fffcf5',
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xs: 'var(--radius-sm)',
				xl: 'var(--radius-xl)'
			},
			fontSize: {
				xs: ['var(--font-size-xs)', { lineHeight: '1.4' }],
				sm: ['var(--font-size-sm)', { lineHeight: '1.5' }],
				base: ['var(--font-size-base)', { lineHeight: '1.6' }],
				lg: ['var(--font-size-lg)', { lineHeight: '1.6' }],
				xl: ['var(--font-size-xl)', { lineHeight: '1.6' }],
				'2xl': ['var(--font-size-2xl)', { lineHeight: '1.4' }],
				'3xl': ['var(--font-size-3xl)', { lineHeight: '1.3' }],
				'4xl': ['var(--font-size-4xl)', { lineHeight: '1.2' }],
			},
			spacing: {
				xs: 'var(--spacing-xs)',
				sm: 'var(--spacing-sm)',
				md: 'var(--spacing-md)',
				lg: 'var(--spacing-lg)',
				xl: 'var(--spacing-xl)',
				'2xl': 'var(--spacing-2xl)',
				'3xl': 'var(--spacing-3xl)',
			},
			boxShadow: {
				sm: 'var(--shadow-sm)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				xl: 'var(--shadow-xl)',
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			letterSpacing: {
				tighter: '-0.025em',
				tight: '-0.0125em',
				normal: '0',
				wide: '0.025em',
				wider: '0.05em',
				widest: '0.1em',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(8px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(16px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.96)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
