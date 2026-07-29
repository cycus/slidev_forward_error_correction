import { defineConfig } from 'unocss'

// Merged into Slidev's built-in UnoCSS config (Slidev calls mergeConfigs), so
// this only ADDS the FEC theme colors + shortcuts — the theme's presets are
// untouched. Colors map to the CSS vars in styles/index.css, so utilities like
// `text-fec-info` / `bg-fec-parity-soft` stay scheme-aware automatically.
export default defineConfig({
  theme: {
    colors: {
      fec: {
        info: 'var(--fec-info)',
        parity: 'var(--fec-parity)',
        error: 'var(--fec-error)',
        corrected: 'var(--fec-corrected)',
        frozen: 'var(--fec-frozen)',
        trivia: 'var(--fec-trivia)',
        'info-soft': 'var(--fec-info-soft)',
        'parity-soft': 'var(--fec-parity-soft)',
        'error-soft': 'var(--fec-error-soft)',
        'corrected-soft': 'var(--fec-corrected-soft)',
        'frozen-soft': 'var(--fec-frozen-soft)',
        'trivia-soft': 'var(--fec-trivia-soft)',
        fg: 'var(--fec-fg)',
        muted: 'var(--fec-muted)',
        surface: 'var(--fec-surface)',
        line: 'var(--fec-line)',
      },
    },
  },
  shortcuts: {
    // Neutral card surface used by content slides. Uses an arbitrary CSS-var value
    // (not `bg-fec-surface-2`) because UnoCSS reads a trailing digit as a shade.
    'fec-card': 'rounded-[var(--fec-radius)] border border-fec-line bg-[var(--fec-surface-2)] p-4 shadow',
    // A small semantic chip, e.g. <span class="fec-chip-info">systematic</span>.
    'fec-chip': 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium',
    'fec-chip-info': 'fec-chip text-fec-info bg-fec-info-soft',
    'fec-chip-parity': 'fec-chip text-fec-parity bg-fec-parity-soft',
    'fec-chip-error': 'fec-chip text-fec-error bg-fec-error-soft',
    'fec-chip-corrected': 'fec-chip text-fec-corrected bg-fec-corrected-soft',
    'fec-chip-frozen': 'fec-chip text-fec-frozen bg-fec-frozen-soft',
  },
})
