# T14 — Part 7 slides: Epilogue — three codes, one phone

## Goal
Land the plane: consolidate the three families into one comparison an engineer will remember, close the Shannon arc, and hand out the reference shelf.

## Slide outline (5 slides)
1. **The matrix.** Side-by-side LDPC / Turbo / Polar:

   | | LDPC | Turbo | Polar |
   |---|---|---|---|
   | Born / boomed | 1962 / 1996–2003 | 1993 | 2008 |
   | Structure | sparse graph | 2×RSC + interleaver | polarized synthetic channels |
   | Decoder | BP / min-sum (parallel) | BCJR iterations (serial trellis) | SCL+CRC (serial in N, parallel in L) |
   | Strengths | throughput, high rates, no floor ≤1e-5 | low-rate waterfall, mature | short blocks, no floor, provable |
   | Weakness | short-block performance | floor + Gbps scaling | throughput scaling in N |
   | Lives in | 5G data, Wi-Fi 6, DVB-S2, 10GBASE-T, SSDs | LTE/HSPA, deep space, DVB-RCS | 5G control (PDCCH/PBCH/UCI) |
   | Flag on gauge | 0.0045 dB (lab) | 0.7 dB (1993) | at capacity (asymptotic) |

   Built as click-revealed rows; final click = the one-liner: "one phone call today touches all three" (5G data LDPC + 5G control polar + 4G fallback turbo).
2. **The gauge, final form.** `DbGauge` full-history version: 1948 gap (11.2 dB) → 2001 (0.04 dB @ n=10⁷) → what a real 5G link does (α≈0.6–0.75 of capacity, 10% BLER + HARQ). Honest closing beat: labs closed the gap; products trade the last dB for latency, power and silicon.
3. **What's next.** One slide, restrained: 6G channel-coding study items (e.g. LDPC/polar evolution, ML-assisted decoding research); finite-blocklength as the URLLC frontier. No hype; only directions with 3GPP/academic paper trails (curate during implementation; anything without a citable source gets cut).
4. **Takeaways.** Five sentences max: (1) capacity is a provable line, not a vibe; (2) soft beats hard by ~2 dB — LLRs are the currency; (3) modern decoding = iterative probabilistic message passing; (4) redundancy is a 30-dB dial managed per-TTI by link adaptation; (5) three code families, one phone.
5. **References & further reading.** Grouped: primary papers (Shannon '48, Gallager '62, Berrou '93, MacKay-Neal '96, Chung '01, Arıkan '09, Tal-Vardy '15, PPV '10) · specs (TS 38.212/38.214, TS 36.212, CCSDS) · accessible deep-dives (Costello-Forney "Road to Capacity", Sklar turbo primer, Johnson LDPC tutorial, Maunder COMST polar survey, Sionna tutorials). QR code to the deck's hosted URL + repo.

## Acceptance criteria
- [ ] Matrix rows accurate against Parts 3–5 content (no new unsourced claims; every cell traceable to an earlier slide).
- [ ] Gauge finale consistent with values used in Parts 1/3/4/5/6.
- [ ] References complete with working links; every in-deck `SourceFoot` citation appears here.
- [ ] Takeaways ≤5 bullets, each ≤1 line.
- [ ] "What's next" contains only cited directions.

## Factual basis
All content consolidates previously-established (T02–T13) facts; no new research required except the "what's next" curation (30 min web check during implementation; candidates: 3GPP Rel-19/20 study items on channel coding evolution — verify existence before use).

## Dependencies
T02–T13 (content-complete deck).
