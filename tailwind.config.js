/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#0f0f1a',
        'dark-slate': '#1a1a2e',
        'dark-card': '#1e1e32',
        'dark-hover': '#252540',
        'dark-void': '#0a0a14',
        magenta: '#f97316',
        'magenta-dark': '#ea580c',
        'magenta-light': '#fb923c',
        cyan: '#06b6d4',
        'cyan-light': '#22d3ee',
        'neon-pink': '#fb923c',
        'neon-blue': '#3b82f6',
        'neon-green': '#10b981',
        'neon-orange': '#f97316',
        'neon-yellow': '#eab308',
        'neon-purple': '#f97316',
        // Cyber theme colors
        'cyber-blue': '#f97316',
        'cyber-pink': '#fb923c',
        'cyber-green': '#00ff88',
        'cyber-purple': '#f97316',
      },
      backgroundImage: {
        'gradient-magenta': 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-green': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%)',
        'gradient-mesh':
          'radial-gradient(at 20% 30%, rgba(249, 115, 22, 0.2) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(251, 146, 60, 0.15) 0px, transparent 50%), radial-gradient(at 10% 70%, rgba(251, 191, 36, 0.15) 0px, transparent 50%)',
        'gradient-cyber': 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
        'gradient-void': 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
      },
      backdropBlur: {
        glass: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(249, 115, 22, 0.37)',
        glow: '0 10px 40px rgba(249, 115, 22, 0.4), 0 0 20px rgba(251, 146, 60, 0.2)',
        'glow-cyan': '0 10px 40px rgba(6, 182, 212, 0.4)',
        'glow-pink': '0 10px 40px rgba(251, 146, 60, 0.4)',
        'glow-sm': '0 4px 20px rgba(249, 115, 22, 0.3)',
        card: '0 8px 30px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 60px rgba(249, 115, 22, 0.25)',
        'inner-glow': 'inset 0 0 30px rgba(249, 115, 22, 0.1)',
        'cyber': '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
        'cyber-pink': '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
        'justice': '0 0 30px rgba(249, 115, 22, 0.5), 0 0 60px rgba(251, 146, 60, 0.3)',
        'orange': '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        stagger: 'stagger 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'cyber-pulse': 'cyberPulse 2s ease-in-out infinite',
        'float-cyber': 'floatCyber 4s ease-in-out infinite',
        'scale-balance': 'scaleBalance 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(249, 115, 22, 0.6), 0 0 80px rgba(251, 146, 60, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        cyberPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        floatCyber: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        scaleBalance: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
