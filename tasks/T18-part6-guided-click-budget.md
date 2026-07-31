# T18 — Restore guided click choreography on Part 6 interactive slides

## Goal
The two Part 6 centerpiece walkthroughs cannot actually be stepped in a live presentation. `BlerExplorer guided` (slide 5, "Explore the curve family") and `HarqIrDemo guided` (slide 8, "Watch redundancy accumulate") read the slide's `$clicks` up to step 4, but **neither host slide declares `clicks:` in its frontmatter**. Each slide's only *registered* click element is its single prose `<v-click>` card, so Slidev computes the slide's click total as 1 — the second key-press navigates to the next slide, and guided steps 2–4 are unreachable.

This corrects the T13-era BACKLOG note that called the shared click stream "functionally fine": the sharing is fine, but the missing `clicks:` budget makes most of the guided script dead in forward navigation.

## Evidence
- `components/BlerExplorer.vue`: `MAX_STEP = 4`; `step = guided ? min($clicks, MAX_STEP) : 0` — steps: 1 = pyAerial layer, 2 = 10% target line, 3 = steepness callout, 4 = A/B redundancy arrow.
- `components/HarqIrDemo.vue`: `nTx = min(guided ? $clicks : ownStep, MAX)` — clicks 1–4 = transmissions Tx1–Tx4 (RV0→RV2→RV3→RV1).
- `pages/part6-bler.md` slides 5 and 8 frontmatter: `layout: default` + `class: px-10` only — no `clicks:`.
- Correct pattern already in the deck: `pages/part1-shannon.md` slide 10 and `pages/part3-ldpc.md` slide 6 both declare `clicks: 4` for their `$clicks`-driven components.

## Fix
1. Add `clicks: 4` to the frontmatter of Part 6 slides 5 and 8.
2. The prose `<v-click>` card on each slide then reveals at click 1 and persists (the T13-documented behaviour). Optionally pin it to a later beat (`v-click="2"`/`"3"`) if the reveal reads better mid-walk.
3. Slide-5 content nit discovered while tracing: in guided mode `BlerExplorer` never draws the Sionna block-length curves (`showBlock = guided ? false : ...`), yet the slide's v-click card says the anchors are "dashed **in the plot**". Either enable the block-length layer at a guided step or soften the card's wording (e.g. "dashed in the explorer's free mode"). Do not silently change data.

## Acceptance criteria
- [ ] Both slides declare `clicks: 4`; `@slidev/parser` still loads 87 slides.
- [ ] Presenter-mode walkthrough (or dev-server `?clicks=` probe) reaches steps 1→4 on both slides before slide navigation advances: BlerExplorer shows pyAerial → target line → steepness → A/B arrow; HarqIrDemo accumulates Tx1→Tx4 with effective rates 0.80 / 0.40 / 0.27 / 0.20.
- [ ] The slide-5 card's "dashed in the plot" wording matches what guided mode actually shows.
- [ ] PDF export unchanged on these pages (export runs `withClicks: false`; fallbacks already render — verified 2026-07-31).

## Factual basis
Component source + frontmatter inspection and the 2026-07-31 flow review; guided step semantics per `tasks/T13-components-bler-harq.md`.

## Dependencies
None (independent of T17/T19). Ship with T17.
