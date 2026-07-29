import { defineKatexSetup } from '@slidev/types'

// KaTeX options + shared macros for the whole deck.
// Keeping macros here means the notation defined once in Part 2 stays consistent
// everywhere (see styles/CONVENTIONS.md → Math notation).
// Docs: https://sli.dev/features/latex · https://katex.org/docs/options.html
export default defineKatexSetup(() => ({
  throwOnError: false,
  macros: {
    '\\SNR': '\\mathrm{SNR}',
    '\\SINR': '\\mathrm{SINR}',
    '\\EbNo': 'E_b/N_0',
    '\\dB': '\\,\\mathrm{dB}',
    '\\LLR': '\\mathrm{LLR}',
    '\\Rcode': 'R',
    '\\Prob': '\\mathbb{P}',
  },
}))
