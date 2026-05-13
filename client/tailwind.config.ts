import type { Config } from 'tailwindcss';

// ─── Paleta extraída do DashDarkX v1.0.0 ─────────────────────────────────────
// Fonte: src/theme/colors.ts + palette.ts + shadows.ts

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {

        // ── Domínio: indicadores de glicemia (projeto) ────────
        glucose: {
          normal:  '#14CA74', // alinhado ao green.500 do template
          warning: '#FDB52A', // alinhado ao yellow.500 do template
          danger:  '#FF5A65', // alinhado ao red.500 do template
        },

        // ── DashDarkX: escala de cinza (backgrounds e texto) ──
        grey: {
          50:  '#F7FAFC',
          100: '#D9E1FA',
          200: '#D1DBF9',
          300: '#AEB9E1',
          400: '#7E89AC',
          500: '#4A5568',
          600: '#343B4F',
          700: '#2D3748',
          800: '#1A202C',
          900: '#171923',
        },

        // ── DashDarkX: cores de acento ────────────────────────
        violet: {
          50:  '#D2A1FF',
          300: '#AF6AF9',
          500: '#CB3CFF', // primary.main do template
          600: '#7F25FB', // gradient state
          700: '#7E22EE',
          900: '#660DE4',
        },
        cyan: {
          50:  '#E6F9FF',
          200: '#80DFFF',
          400: '#21C3FC',
          500: '#00C2FF', // secondary.main do template
          600: '#1A9FB3',
          900: '#004466',
        },
        emerald: {
          50:  '#E3F9ED',
          100: '#B8F0D3',
          300: '#61DD9F',
          500: '#14CA74',
          700: '#0F9C5B',
          900: '#0A6D41',
        },
        amber: {
          50:  '#FFF7E6',
          200: '#FFE066',
          400: '#FFC107',
          500: '#FDB52A',
          700: '#B38F00',
        },
        rose: {
          50:  '#FFE5E7',
          200: '#FF9298',
          400: '#FF404A',
          500: '#FF5A65',
          700: '#C0333B',
        },
        cobalt: {
          200: '#0E43FB',
          500: '#082366',
          700: '#0B1739',
          800: '#0A1330',
          900: '#081028',
        },

        // ── Superfícies de tela (mapeadas do grey do template) ─
        surface: {
          page:    '#171923', // grey.900 — fundo da página
          card:    '#1A202C', // grey.800 — card principal
          raised:  '#2D3748', // grey.700 — card elevado / hover
          overlay: '#343B4F', // grey.600 — modal / dropdown
        },

        // ── Texto ─────────────────────────────────────────────
        ink: {
          primary:   '#FFFFFF',
          secondary: '#AEB9E1', // grey.300
          muted:     '#7E89AC', // grey.400
          faint:     '#4A5568', // grey.500
        },

        // ── Bordas ────────────────────────────────────────────
        edge: {
          default: '#343B4F', // grey.600
          subtle:  '#2D3748', // grey.700
          strong:  'rgba(203,60,255,0.35)', // violet tinted
        },

        // ── Status com transparência (badges / alertas) ───────
        status: {
          success:        '#14CA74',
          'success-bg':   '#05C16833',
          warning:        '#FDB52A',
          'warning-bg':   '#FFB01633',
          error:          '#FF5A65',
          'error-bg':     '#FF5A6533',
          'error-edge':   '#FF9298',
        },

        // ── Login: Navy + Dourado (página de login) ───────────
        navy: {
          50:  '#f0f4f9',
          100: '#d6e2ef',
          300: '#7fa3c4',
          500: '#2a5298',
          700: '#1a3a5c',
          900: '#0f2444',
        },
        gold: {
          100: '#f5e9d5',
          300: '#e8c89a',
          500: '#c9a96e',
          700: '#b8925a',
          900: '#8a6a3a',
        },
        linen: {
          50:  '#faf9f6',
          100: '#f5f3ef',
          200: '#ede9e2',
        },
      },

      fontFamily: {
        // Fonte principal do template (arquivos em src/assets/fonts/mona-sans/)
        sans:    ['"Mona Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        // Fontes complementares
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Lato"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        // Escala tipográfica do template
        'h1': ['3rem',    { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.5rem',  { lineHeight: '1.35', fontWeight: '700' }],
        'h5': ['1.25rem', { lineHeight: '1.4', fontWeight: '700' }],
        'h6': ['1.125rem',{ lineHeight: '1.4', fontWeight: '700' }],
        // Glicemia — display grande para leitura rápida
        'glucose-value': ['3rem', { lineHeight: '1', fontWeight: '700' }],
      },

      letterSpacing: {
        'ultra': '0.2em',
        'wide':  '0.08em',
      },

      borderRadius: {
        btn:   '6px',
        input: '4px',
        card:  '16px',
        modal: '20px',
      },

      boxShadow: {
        // Sombras do template (src/theme/shadows.ts)
        'dash':    '0px 8px 28px 0px rgba(1,5,17,0.30)',
        'dash-sm': '0px 2px 4px 0px rgba(1,5,17,0.20)',
        // Login card
        'float':   '0 8px 40px rgba(15,36,68,0.10), 0 2px 12px rgba(15,36,68,0.06)',
        'float-lg':'0 20px 60px rgba(15,36,68,0.14), 0 4px 20px rgba(15,36,68,0.08)',
        // Glow violet (primary CTA no dashboard)
        'glow':    '0 0 20px rgba(203,60,255,0.30), 0 0 0 1px rgba(203,60,255,0.20)',
        'glow-lg': '0 0 40px rgba(203,60,255,0.40)',
        // Glow cyan (secondary)
        'glow-cyan':    '0 0 20px rgba(0,194,255,0.25)',
        // Glow por status de glicemia
        'glow-normal':  '0 0 32px rgba(20,202,116,0.35)',
        'glow-warning': '0 0 32px rgba(253,181,42,0.35)',
        'glow-danger':  '0 0 32px rgba(255,90,101,0.35)',
        'inset':        'inset 0 1px 4px rgba(0,0,0,0.6)',
      },

      backgroundImage: {
        // Fundo principal do dashboard (dark)
        'gradient-page': [
          'radial-gradient(ellipse at 80% 0%,   rgba(203,60,255,0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 10% 100%, rgba(0,194,255,0.06)  0%, transparent 50%)',
          'linear-gradient(180deg, #171923 0%, #0F1117 100%)',
        ].join(', '),
        // Card com brilho sutil
        'gradient-card': [
          'linear-gradient(145deg, #1A202C 0%, #1E2535 100%)',
        ].join(', '),
        // Gradient do botão primário (violet)
        'gradient-primary': 'linear-gradient(135deg, #CB3CFF 0%, #7F25FB 100%)',
        // Login — linho quente
        'gradient-linen': [
          'radial-gradient(ellipse at 80% 0%,   rgba(15,36,68,0.05)    0%, transparent 55%)',
          'radial-gradient(ellipse at 10% 100%, rgba(201,169,110,0.08) 0%, transparent 50%)',
          'linear-gradient(160deg, #faf9f6 0%, #f0ede7 100%)',
        ].join(', '),
      },
    },
  },
  plugins: [],
};

export default config;
