import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				'50': '#f0f7ff',
  				'100': '#e0effe',
  				'200': '#bae0fd',
  				'300': '#7cc8fb',
  				'400': '#36acf6',
  				'500': '#0c91e7',
  				'600': '#0073c5',
  				'700': '#015b9f',
  				'800': '#064d83',
  				'900': '#0b416d',
  				'950': '#072949'
  			},
  			slate: {
  				'850': '#172033',
  				'925': '#0d1420',
  				'950': '#080c14'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'SF Mono',
  				'Monaco',
  				'monospace'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-out',
  			'fade-in-up': 'fadeInUp 0.4s ease-out',
  			'slide-in-right': 'slideInRight 0.3s ease-out',
  			'slide-in-up': 'slideInUp 0.3s ease-out',
  			'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'glow': 'glow 2s ease-in-out infinite alternate'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			fadeInUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			slideInUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			pulseSoft: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 20px rgba(0, 145, 231, 0.2)'
  				},
  				'100%': {
  					boxShadow: '0 0 30px rgba(0, 145, 231, 0.4)'
  				}
  			}
  		},
  		boxShadow: {
  			'glow-sm': '0 0 10px rgba(0, 145, 231, 0.2)',
  			'glow-md': '0 0 20px rgba(0, 145, 231, 0.3)',
  			'glow-lg': '0 0 30px rgba(0, 145, 231, 0.4)',
  			'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
  			'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  			'card-hover': '0 12px 24px -8px rgba(0, 0, 0, 0.3), 0 4px 8px -4px rgba(0, 0, 0, 0.2)',
  			'elevated': '0 20px 40px -12px rgba(0, 0, 0, 0.4)'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		borderRadius: {
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		transitionTimingFunction: {
  			'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
