# T04 — Part 2 slides: The Toolbox — parity, distance, soft bits

## Goal
The conceptual kit every code family uses: block codes, redundancy, distance, and — the deck's explicit special mention — **soft bits and the probabilistic view of decoding**. After this part the audience thinks in LLRs.

## Slide outline (9 slides)
1. **Section cover.** "Before the heroes: the toolbox."
2. **Codes 101.** (n,k), rate R=k/n, redundancy n−k; systematic vs non-systematic; the encoder adds *structure*, the decoder exploits it. Example inline: rate 1/3 = "say it three times" (repetition), immediately shown to be a weak use of redundancy (sets up that WHERE you spend redundancy matters — the whole point of Parts 3–5).
3. **INTERACTIVE — `HammingPlayground`.** Hamming (7,4): type 4 data bits → 3 parity bits appear (blue/amber per T01 colors); flip any channel bit → syndrome points at it → corrected (green). Flip two → miscorrection: distance limits! `TriviaCard`: Hamming 1950, BSTJ — born of weekend batch-job rage at Bell Labs relay computers.
4. **Distance & minimum distance.** d_min decides guaranteed correction ⌊(d_min−1)/2⌋; sphere-packing picture. Why big random-ish codes are good (Shannon's insight) but undecodable naively — bridge to "structured randomness" of modern codes.
5. **The receiver's real problem.** Demodulator sees a *cloud*, not bits. Hard decision throws information away. Number: soft-decision decoding buys **≈2 dB** over hard (Gibson, Mobile Comms Handbook 2017; CCSDS: hard loss >2 dB for K=7 Viterbi).
6. **LLR — the currency of modern receivers.** Definition LLR = ln[P(b=0|y)/P(b=1|y)]; **sign = decision, magnitude = confidence**; BPSK/AWGN: LLR = 2y/σ². Notation slide — fix polarity convention (positive ⇒ 0, 3GPP/MATLAB style) for the whole deck. KaTeX stepped reveal.
7. **INTERACTIVE — `LlrVisualizer` view 1.** Slider = received y; live LLR bar; noise σ slider (shows confidence collapse as noise grows). Then QAM tab: 16QAM soft demapping — bit reliability differs per bit position (max-log, nearest-point differences) — foreshadows why rate matching interleaves bits onto QAM positions (Part 3).
8. **Worked example — soft beats hard.** The repetition-code case from research: b=0 sent as (+1,+1,+1), σ²=0.5, received y=(+0.9, −0.15, −0.25). Hard majority: (0,1,1) → decodes **1, wrong**. LLRs (4y): (+3.6, −0.6, −1.0), sum = +2.0 → decodes **0, right**. Two low-confidence wrongs lose to one high-confidence right. Click-through table.
9. **The probabilistic mindset.** Decoding = Bayesian inference on a graph of constraints; iterative decoders *negotiate* beliefs. Receive chain context for 5G engineers: demapper → descrambler → rate de-matcher (LLR combining) → decoder → CRC (MathWorks DL-SCH chain docs). "Everything from here on is message passing."

## Acceptance criteria
- [ ] 9 slides per outline; notation convention slide (6) is unambiguous and referenced by later parts.
- [ ] Worked example (8) numbers exactly as specified (they're self-consistent: 4y since 2/σ²=4).
- [ ] Receive-chain diagram (9) uses Mermaid or simple SVG, colors per T01 semantics.
- [ ] Slides 3 and 7 embed components with graceful placeholder if T05 not yet merged.
- [ ] Every quantitative claim footnoted (2 dB soft gain; LLR formulas).

## Factual basis (sources)
- LLR definition & max-log demapping: MathWorks Symbol Demodulator / qamdemod docs; standard textbook.
- 2y/σ² for BPSK: standard; flag "derived" in source note.
- ~2 dB soft-vs-hard: Gibson, *Mobile Communications Handbook* (2017), via T&F knowledge page; CCSDS 130.1-G-1 (hard loss >2 dB, 8-bit quant <0.2 dB).
- LLR widths in hardware: MathWorks NR LDPC Decoder HDL block 4–16 bit; FPGA study (Cal Poly 2026 thesis): 6-bit VN / 5-bit CN messages ≈ 0.05 dB spread. "5–8 bits typical" is folklore — present as range with the two hard citations.
- Receive chain order: MathWorks "DL-SCH and PDSCH transmit and receive processing chain".
- Hamming 1950 story: NPS 1995 Hamming lecture transcript.

## Dependencies
T01. Components: T05 (parallel OK).
