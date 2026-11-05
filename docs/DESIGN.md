# ProsParity design system

Status: built. The colours are sampled from the deck. The final sitemap is in `docs/SITEMAP.md`, and draft copy awaiting sign-off is in `docs/OPEN_ITEMS.md`.

Files that go with this document:

| File | What it is |
| --- | --- |
| `docs/design/tokens.json` | Single source for colour, type, spacing, grid, radii, shadow and motion tokens |
| `scripts/contrast-check.mjs` | WCAG AA check. Run `node scripts/contrast-check.mjs --write` to refresh section 3.3 |
| `docs/design/hero-three-wheeler.svg` | The vehicle drawing |
| `docs/design/hero-stage-props.svg` | The five stage props |
| `docs/design/fonts/` | Built web fonts, licences and `build-fonts.py` |
| `docs/design/specimens/` | Rendered specimens and mocks, referenced throughout |

---

## 1. What came from each skill

**frontend-design (Anthropic).** Four rules changed the work.

- "Spend your boldness in one place" means the vehicle walking the loop is the only showpiece. Everything else is quiet type and hairlines.
- Its list of AI tells became a ban list for this project: all-caps eyebrows, `A · B · C` meta strings, monospace data labels, `→` on buttons, and one radius on everything. It also names "near-black with one bright acid green", which is what our dark band could become. That is why signal green stays small, and why dark sections are rationed.
- Numbers are used only for true sequences. The five lifecycle stages and the onboarding steps are numbered; audience paths and products are not.
- "Remove one accessory" was applied literally. I cut a crate from the service scene, wheel spokes, and a font axis that did nothing.

**ui-ux-pro-max.** I ran `--design-system` and targeted searches. I kept the concrete rules and rejected the generated look.

- Kept: `focus-not-obscured` (scroll-padding under the sticky header), `number-tabular`, `contrast-data` (marks 3:1, labels 4.5:1), `data-table` (a text equivalent for every chart), `direct-labeling`, `responsive-chart`, `error-summary`, `focus-on-route-change`, and the "Trust and Authority" section order of credibility, proof, solution, clear next step.
- Rejected: the generated palette (amber and purple on navy) contradicts section 6.3 and the "no purple" ban. IBM Plex Sans is the generic finance answer. The GSAP snippet is the wrong stack. Unconditional `scroll-behavior: smooth` breaks the reduced-motion rule.
- Gap: its typography data has no Devanagari pairing (0 results), so that decision rests on the tests in section 4.5, not on the database.

**emil-design-eng.** Mainly the decision order: should it animate, why, which curve, how fast.

- The hero does not animate on load. People see it every visit, it would delay reading, and it protects LCP.
- Hover effects sit behind `@media (hover: hover) and (pointer: fine)`.
- Progress is written to each element's `transform`, never to a CSS variable on the stage, because variables recalculate every child.
- Transitions, not keyframes, for anything that can be interrupted.
- Reduced motion keeps opacity changes that aid comprehension, but section 6.6 asks for instant states, so the brief wins (see section 7.8).
- Two places where the brief overrides the skill: press feedback is 200ms rather than 100–160ms, because section 6.6 sets a 200ms floor; and the skill's stagger range of 30–80ms narrows to 40–60ms.

---

## 2. Visual direction

**Point of view.** ProsParity's argument is that an EV's value is knowable if you follow its battery. So the site follows one vehicle. It behaves like a well-kept ledger: white paper, forest ink, ruled lines, exact figures, every number with its date and source. It speaks plainly to a dealer in Bhopal and to an investor reading on a laptop, and it has nothing to prove with effects.

**What makes it recognisably ProsParity, and not a fintech template:**

1. **The vehicle.** An Indian e-auto, drawn by hand in line, is the main image on the site. Fintech templates show phones, dashboards and abstract shapes. Ours shows the asset being financed.
2. **The road.** A single 3px forest line that the vehicle stands on. It runs off the right edge of the screen, and it is the same line that rules the metric lists, in hairline weight. One line carries the whole site, from hero to figures.
3. **The five-cell gauge.** The battery pack in the drawing is also the indicator beside it. Cells fill forest for ProsParity's stages and teal for Battron's, so the gauge itself explains the two businesses. It recurs as a small mark on Battron and audience pages.
4. **The two-ink rule.** Forest means Lending and teal means Battron, everywhere, including charts, links and the vehicle's own line colour. A reader learns the company's structure from colour without being told.
5. **Indian numerals as typography.** `₹71.9 Cr` set large, in lakh and crore grouping, on hairline-ruled lists rather than stat cards. It reads as Indian finance at a glance.

Palette in one line: white, forest `#004737`, teal `#009B9E`, deep `#061C23`, signal `#3AF779` (small doses on dark only), with pale `#F1F6F3` and mint `#DDF9E7` for bands.

See `specimens/hero-en-1440.png` and `specimens/lifecycle-storyboard.png`.

---

## 3. Colour

### 3.1 Primitives

All sampled from the deck by Agent C unless marked derived. Derived colours exist only to pass contrast, and should be recomputed if a sampled colour changes.

| Token | Hex | Source | Role |
| --- | --- | --- | --- |
| `white` | #FFFFFF | Deck | Page background |
| `pale` | #F1F6F3 | Deck | Tinted bands and panels |
| `mint` | #DDF9E7 | Deck | Lending panels; body text on dark |
| `battron-tint` | #C7E9E9 | Deck | Battron panels |
| `forest` | #004737 | Deck | Lending ink, headings, primary buttons |
| `teal` | #009B9E | Deck | Battron marks: bars, cells, large figures only |
| `deep` | #061C23 | Deck | Dark sections, and body text on light |
| `signal` | #3AF779 | Deck | Dark sections only: key figures, focus rings, one button |
| `loss` | #D7472F | Deck | Comparison bar and large comparison figure only |
| `hairline` | #CBD8D6 | Deck | Rules. Decorative: never an input border |
| `teal-text` | #00706F | Derived | All Battron text, Battron button fill |
| `teal-on-dark` | #4FD1CF | Derived | Battron text on dark |
| `loss-text` | #B8371F | Derived | Comparison labels at text size |
| `loss-on-dark` | #FF9A85 | Derived | Comparison labels on dark |
| `error` | #B3261E | Derived | Form errors |
| `error-on-dark` | #FFB4A8 | Derived | Form errors on dark |
| `slate` | #4A5F60 | Derived | Secondary text |
| `control` | #677D7C | Derived | Input borders, empty gauge cells |
| `hairline-dark` | #1F3C42 | Derived | Rules on dark. Decorative |
| `control-dark` | #6F9190 | Derived | Input borders on dark |

### 3.2 Decisions and corrections

- **Deep panel differs from section 6.3.** The brief says green-black (`#072522`); the deck is bluer and darker (`#061C23`). Section 6.3 says to sample from the deck, so `#061C23` is used. Flat only: the deck's gradients are an export artefact and gradient washes would read as template.
- **Body text is `deep`,** matching the deck, rather than a separate near-black.
- **Form errors get their own red.** Section 6.3 reserves loss red for comparisons, so reusing it for errors would break the rule and blur the meaning. `error` is a separate token.
- **Colour never carries meaning alone.** The comparison chart is directly labelled, form errors have text and an icon, and links are underlined in body copy.

### 3.3 Contrast table

Generated by `scripts/contrast-check.mjs`. Do not edit by hand.

<!-- contrast:start -->
Thresholds: text 4.5:1, large text 3:1 (at least 24px, or 18.66px bold), UI and graphics 3:1. Ratios are rounded down.

**78 of 78 intended pairings pass.**

| Foreground | Background | Use | Type | Ratio | Needs | Result |
| --- | --- | --- | --- | ---: | ---: | --- |
| `text` #061C23 | `bg-page` #FFFFFF | Body copy | Text | 17.52 | 4.5 | Pass |
| `text` #061C23 | `bg-tint` #F1F6F3 | Body copy on tinted band | Text | 16.03 | 4.5 | Pass |
| `text` #061C23 | `bg-mint` #DDF9E7 | Body copy on mint panel | Text | 15.67 | 4.5 | Pass |
| `text-muted` #4A5F60 | `bg-page` #FFFFFF | Secondary copy, source notes | Text | 6.78 | 4.5 | Pass |
| `text-muted` #4A5F60 | `bg-tint` #F1F6F3 | Secondary copy on tinted band | Text | 6.20 | 4.5 | Pass |
| `text-muted` #4A5F60 | `bg-mint` #DDF9E7 | Secondary copy on mint panel | Text | 6.06 | 4.5 | Pass |
| `heading` #004737 | `bg-page` #FFFFFF | Headings, links, metric figures | Text | 10.73 | 4.5 | Pass |
| `heading` #004737 | `bg-tint` #F1F6F3 | Headings and links on tinted band | Text | 9.82 | 4.5 | Pass |
| `heading` #004737 | `bg-mint` #DDF9E7 | Headings and links on mint panel | Text | 9.59 | 4.5 | Pass |
| `battron-text` #00706F | `bg-page` #FFFFFF | Battron headings, links, figures | Text | 5.92 | 4.5 | Pass |
| `battron-text` #00706F | `bg-tint` #F1F6F3 | Battron text on tinted band | Text | 5.41 | 4.5 | Pass |
| `battron-text` #00706F | `bg-mint` #DDF9E7 | Battron text on mint panel | Text | 5.29 | 4.5 | Pass |
| `loss-label` #B8371F | `bg-page` #FFFFFF | Comparison label (industry 20–25%) | Text | 5.82 | 4.5 | Pass |
| `loss-label` #B8371F | `bg-tint` #F1F6F3 | Comparison label on tinted band | Text | 5.33 | 4.5 | Pass |
| `loss-label` #B8371F | `bg-mint` #DDF9E7 | Comparison label on mint panel | Text | 5.21 | 4.5 | Pass |
| `error-text` #B3261E | `bg-page` #FFFFFF | Form error text | Text | 6.53 | 4.5 | Pass |
| `error-text` #B3261E | `bg-tint` #F1F6F3 | Form error text on tinted band | Text | 5.98 | 4.5 | Pass |
| `error-text` #B3261E | `bg-mint` #DDF9E7 | Form error text on mint panel | Text | 5.84 | 4.5 | Pass |
| `on-primary` #FFFFFF | `bg-primary` #004737 | Primary button label | Text | 10.73 | 4.5 | Pass |
| `on-primary` #FFFFFF | `bg-battron` #00706F | Battron button label | Text | 5.92 | 4.5 | Pass |
| `on-dark` #FFFFFF | `bg-dark` #061C23 | Text on dark band, footer | Text | 17.52 | 4.5 | Pass |
| `on-dark-muted` #DDF9E7 | `bg-dark` #061C23 | Secondary text on dark band | Text | 15.67 | 4.5 | Pass |
| `on-dark-accent` #3AF779 | `bg-dark` #061C23 | Key figures on dark band | Text | 12.31 | 4.5 | Pass |
| `on-dark-battron` #4FD1CF | `bg-dark` #061C23 | Battron text on dark band | Text | 9.47 | 4.5 | Pass |
| `on-dark-loss` #FF9A85 | `bg-dark` #061C23 | Comparison label on dark band | Text | 8.52 | 4.5 | Pass |
| `on-dark-error` #FFB4A8 | `bg-dark` #061C23 | Form error text on dark band | Text | 10.30 | 4.5 | Pass |
| `bg-dark` #061C23 | `signal` #3AF779 | Button on dark band: deep label, signal fill | Text | 12.31 | 4.5 | Pass |
| `mark-battron` #009B9E | `bg-page` #FFFFFF | Raw teal, large display figures only | Large text | 3.39 | 3 | Pass |
| `mark-loss` #D7472F | `bg-page` #FFFFFF | Raw red, large comparison figure only | Large text | 4.34 | 3 | Pass |
| `mark-loss` #D7472F | `bg-tint` #F1F6F3 | Raw red large figure on tinted band | Large text | 3.97 | 3 | Pass |
| `mark-loss` #D7472F | `bg-mint` #DDF9E7 | Raw red large figure on mint panel | Large text | 3.88 | 3 | Pass |
| `mark-loss` #D7472F | `bg-dark` #061C23 | Raw red large figure on dark band | Large text | 4.03 | 3 | Pass |
| `mark-lending` #004737 | `bg-page` #FFFFFF | Lending chart mark, illustration line | UI / graphic | 10.73 | 3 | Pass |
| `mark-lending` #004737 | `bg-tint` #F1F6F3 | Lending chart mark on tinted band | UI / graphic | 9.82 | 3 | Pass |
| `mark-lending` #004737 | `bg-mint` #DDF9E7 | Lending chart mark on mint panel | UI / graphic | 9.59 | 3 | Pass |
| `mark-battron` #009B9E | `bg-page` #FFFFFF | Battron chart bar, gauge cell on white | UI / graphic | 3.39 | 3 | Pass |
| `mark-battron` #009B9E | `bg-tint` #F1F6F3 | Battron chart bar, gauge cell on tinted band | UI / graphic | 3.10 | 3 | Pass |
| `mark-battron` #009B9E | `bg-mint` #DDF9E7 | Battron chart bar, gauge cell on mint panel | UI / graphic | 3.03 | 3 | Pass |
| `mark-loss` #D7472F | `bg-page` #FFFFFF | Industry bar in recovery chart | UI / graphic | 4.34 | 3 | Pass |
| `mark-loss` #D7472F | `bg-tint` #F1F6F3 | Industry bar on tinted band | UI / graphic | 3.97 | 3 | Pass |
| `mark-loss` #D7472F | `bg-dark` #061C23 | Industry bar on dark band | UI / graphic | 4.03 | 3 | Pass |
| `on-dark-accent` #3AF779 | `bg-dark` #061C23 | Chart mark, focus ring on dark | UI / graphic | 12.31 | 3 | Pass |
| `mark-battron` #009B9E | `bg-dark` #061C23 | Battron bar on dark band | UI / graphic | 5.15 | 3 | Pass |
| `border-control` #677D7C | `bg-page` #FFFFFF | Input border, empty gauge cell outline | UI / graphic | 4.37 | 3 | Pass |
| `border-control` #677D7C | `bg-tint` #F1F6F3 | Input border on tinted band | UI / graphic | 4.00 | 3 | Pass |
| `border-control` #677D7C | `bg-mint` #DDF9E7 | Input border on mint panel | UI / graphic | 3.91 | 3 | Pass |
| `border-control-dark` #6F9190 | `bg-dark` #061C23 | Input border on dark band | UI / graphic | 5.11 | 3 | Pass |
| `focus` #004737 | `bg-page` #FFFFFF | Focus ring | UI / graphic | 10.73 | 3 | Pass |
| `focus` #004737 | `bg-tint` #F1F6F3 | Focus ring on tinted band | UI / graphic | 9.82 | 3 | Pass |
| `focus` #004737 | `bg-mint` #DDF9E7 | Focus ring on mint panel | UI / graphic | 9.59 | 3 | Pass |
| `focus-dark` #3AF779 | `bg-dark` #061C23 | Focus ring on dark band | UI / graphic | 12.31 | 3 | Pass |
| `bg-primary` #004737 | `bg-page` #FFFFFF | Primary button shape against page | UI / graphic | 10.73 | 3 | Pass |
| `bg-battron` #00706F | `bg-page` #FFFFFF | Battron button shape against page | UI / graphic | 5.92 | 3 | Pass |
| `text` #061C23 | `bg-battron-tint` #C7E9E9 | Body copy on Battron panel | Text | 13.57 | 4.5 | Pass |
| `heading` #004737 | `bg-battron-tint` #C7E9E9 | Headings and links on Battron panel | Text | 8.31 | 4.5 | Pass |
| `text-muted` #4A5F60 | `bg-battron-tint` #C7E9E9 | Secondary copy on Battron panel | Text | 5.25 | 4.5 | Pass |
| `battron-text` #00706F | `bg-battron-tint` #C7E9E9 | Battron text on Battron panel | Text | 4.58 | 4.5 | Pass |
| `border-control` #677D7C | `bg-battron-tint` #C7E9E9 | Input border on Battron panel | UI / graphic | 3.38 | 3 | Pass |
| `focus` #004737 | `bg-battron-tint` #C7E9E9 | Focus ring on Battron panel | UI / graphic | 8.31 | 3 | Pass |
| `battron-text` #00706F | `bg-battron-tint` #C7E9E9 | Battron bar, gauge cell on Battron panel | UI / graphic | 4.58 | 3 | Pass |
| `text` #061C23 | `bg-leaf` #EAF8EF | Body copy on green band | Text | 16.00 | 4.5 | Pass |
| `text-muted` #4A5F60 | `bg-leaf` #EAF8EF | Secondary copy on green band | Text | 6.19 | 4.5 | Pass |
| `heading` #004737 | `bg-leaf` #EAF8EF | Headings and links on green band | Text | 9.79 | 4.5 | Pass |
| `battron-text` #00706F | `bg-leaf` #EAF8EF | Battron text on green band | Text | 5.40 | 4.5 | Pass |
| `loss-label` #B8371F | `bg-leaf` #EAF8EF | Comparison label on green band | Text | 5.31 | 4.5 | Pass |
| `error-text` #B3261E | `bg-leaf` #EAF8EF | Form error on green band | Text | 5.96 | 4.5 | Pass |
| `mark-lending` #004737 | `bg-leaf` #EAF8EF | Chart mark, illustration line | UI / graphic | 9.79 | 3 | Pass |
| `border-control` #677D7C | `bg-leaf` #EAF8EF | Input border on green band | UI / graphic | 3.99 | 3 | Pass |
| `focus` #004737 | `bg-leaf` #EAF8EF | Focus ring on green band | UI / graphic | 9.79 | 3 | Pass |
| `text` #061C23 | `bg-sage` #CFF0DB | Body copy on green band | Text | 14.30 | 4.5 | Pass |
| `text-muted` #4A5F60 | `bg-sage` #CFF0DB | Secondary copy on green band | Text | 5.53 | 4.5 | Pass |
| `heading` #004737 | `bg-sage` #CFF0DB | Headings and links on green band | Text | 8.76 | 4.5 | Pass |
| `battron-text` #00706F | `bg-sage` #CFF0DB | Battron text on green band | Text | 4.83 | 4.5 | Pass |
| `loss-label` #B8371F | `bg-sage` #CFF0DB | Comparison label on green band | Text | 4.75 | 4.5 | Pass |
| `error-text` #B3261E | `bg-sage` #CFF0DB | Form error on green band | Text | 5.33 | 4.5 | Pass |
| `mark-lending` #004737 | `bg-sage` #CFF0DB | Chart mark, illustration line | UI / graphic | 8.76 | 3 | Pass |
| `border-control` #677D7C | `bg-sage` #CFF0DB | Input border on green band | UI / graphic | 3.56 | 3 | Pass |
| `focus` #004737 | `bg-sage` #CFF0DB | Focus ring on green band | UI / graphic | 8.76 | 3 | Pass |

### Pairings ruled out

These are why the text-safe variants exist. Never use them for the stated purpose.

| Foreground | Background | Would be used for | Ratio | Needs | Use instead |
| --- | --- | --- | ---: | ---: | --- |
| `teal` #009B9E | `white` #FFFFFF | Teal body text, links | 3.39 | 4.5 | `battron-text` |
| `white` #FFFFFF | `teal` #009B9E | White label on teal button | 3.39 | 4.5 | `bg-battron` fill |
| `loss` #D7472F | `white` #FFFFFF | Red comparison label | 4.34 | 4.5 | `loss-label` |
| `loss` #D7472F | `pale` #F1F6F3 | Red label on tinted band | 3.97 | 4.5 | `loss-label` |
| `loss` #D7472F | `deep` #061C23 | Red label on dark band | 4.03 | 4.5 | `on-dark-loss` |
| `signal` #3AF779 | `white` #FFFFFF | Signal green on light (banned by section 6.3) | 1.42 | 4.5 | `heading` |
| `signal` #3AF779 | `white` #FFFFFF | Signal green mark or focus ring on light | 1.42 | 3 | `focus` |
| `hairline` #CBD8D6 | `white` #FFFFFF | Hairline as an input border | 1.46 | 3 | `border-control` |
| `teal` #009B9E | `battron-tint` #C7E9E9 | Teal bar on Battron panel | 2.63 | 3 | `battron-text` |
<!-- contrast:end -->

Failures found and what replaced them:

| Failure | Measured | Fix |
| --- | --- | --- |
| Teal text on white | 3.39 (needs 4.5) | `teal-text` #00706F, 5.92 |
| White label on a teal button | 3.39 (needs 4.5) | Battron button fills with `teal-text`, 5.92 |
| Teal bar on `battron-tint` | 2.63 (needs 3) | `teal-text` for marks on that panel |
| Loss red text on white, pale, deep | 4.34, 3.97, 4.03 (needs 4.5) | `loss-text` on light, `loss-on-dark` on dark. Raw red stays for bars and large figures |
| Signal green on white | 1.42 | Banned on light. Focus rings use `forest` on light |
| Hairline as an input border | 1.46 (needs 3) | `control` #677D7C |

---

## 4. Typography

### 4.1 Decision

**Latin: Google Sans Flex. Devanagari: Google Sans.** Both are openly licensed, and both are self-hosted as custom subsets through `next/font/local`.

### 4.2 Licence evidence

Checked in the `google/fonts` repository, not inferred from the Google Fonts listing.

| Check | Google Sans Flex | Google Sans |
| --- | --- | --- |
| Directory | `ofl/googlesansflex/` (`apache/` and `ufl/` return 404) | `ofl/googlesans/` (`apache/` and `ufl/` return 404) |
| `METADATA.pb` | `license: "OFL"` | `license: "OFL"` |
| `OFL.txt` | SIL OFL 1.1 | SIL OFL 1.1 |
| Reserved Font Names | None | None |
| Font name table | OFL 1.1 in the licence record, `Version 5.000` | OFL 1.1 in the licence record, `Version 14.000` |
| `TRADEMARKS.md` | Present | Present |

**Trademark limit.** Both `TRADEMARKS.md` files say the Google names are trademarks of Google LLC. They may be used only in connection with the original software, without implying affiliation, and not in a company, product or domain name. A subset is a Modified Version under the OFL, so `build-fonts.py` renames the files **ProsParity Sans** and **ProsParity Sans Devanagari**, keeps the copyright and licence records (OFL condition 2), and ships both `OFL.txt` files. The subset also removes the Google logo glyphs that are present in the Flex source. Do not describe these fonts as Google products anywhere in the site.

This is my reading of the licence files, not legal advice. It is low risk, but list it for whoever signs off the launch.

### 4.3 Delivery: local subsets, not `next/font/google`

`next/font/google` does serve both families. I confirmed this with a real `next build` on Next 16.4.5. I still chose local files, for three measured reasons:

| Problem with `next/font/google` | Evidence | With the local subset |
| --- | --- | --- |
| `₹` is outside the `latin` slice | U+20B9 falls in `latin-ext`, so any page with a rupee figure loads a second file | `₹` is in the one file |
| Weight | `latin` 132.9 KB + `latin-ext` 65.8 KB = **198.7 KB** with optical sizing | **73.7 KB** |
| No metric fallback | Build warning: "Failed to find font override values for font `Google Sans Flex`". That is a CLS risk against the 0.05 bar | `adjustFontFallback` generates one (`size-adjust: 102.1%`), no warnings |

Measured sizes:

| Option | Size |
| --- | ---: |
| Google slices, weight axis only, no optical sizing | 75.6 KB |
| Google slices with optical sizing | 198.7 KB |
| **Our Flex subset: wght 400–700, opsz 14–96, ROND, slnt and wdth pinned** | **73.7 KB** |
| Similar subset with opsz pinned at 18 | About 34 KB |
| **Our Devanagari subset: wght 400–700** | **46.8 KB** |

Optical sizing costs about 40 KB and is worth it. Section 6.4 asks for it, it gives the display sizes their engineered tightness, and opsz 14 visibly opens up small text on phones (`specimens/flex-optical-size.png`).

Move `docs/design/fonts/*.woff2` to `apps/web/src/fonts/`, along with the OFL files, and use this configuration, which I tested in a real build:

```ts
import localFont from 'next/font/local';

export const sans = localFont({
  src: './fonts/prosparity-sans.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-sans',
  adjustFontFallback: 'Arial',
});

export const devanagari = localFont({
  src: './fonts/prosparity-sans-devanagari.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-deva',
  preload: false,
  adjustFontFallback: false,
  declarations: [{
    prop: 'unicode-range',
    value: 'U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF',
  }],
});
```

```css
html {
  font-family: var(--font-sans), var(--font-deva), system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-optical-sizing: auto;
  font-synthesis: none;
}
```

- The `unicode-range` means English pages never download the Devanagari file. Verified: `/en` mocks load only the Latin font, `/hi` mocks load both.
- **Trap:** a `हिन्दी` label in the locale switcher on English pages would trigger that 46.8 KB download on every page. Set that one label to `font-family: system-ui, sans-serif`.
- `preload: false` is deliberate. `next/font` preloads per layout, so preloading would charge English pages too. Hindi text paints first in the phone's system Devanagari font, then swaps. Line heights are unitless, so the swap should not move the page, but Agent L should confirm it.
- The subset contains no `→`. Draw arrows as SVG, and do not add them to button text.

### 4.4 Type scale

Seven steps, fluid from 360 to 1440px. Sizes use `rem` plus `vw`, so browser zoom still works.

| Step | `font-size` | px | Tracking | Line height | Weight |
| --- | --- | --- | --- | --- | --- |
| `display` | `clamp(2.5rem, 1.6667rem + 3.7037vw, 5rem)` | 40–80 | -0.022em | 1.04 | 560 |
| `title` | `clamp(2rem, 1.5rem + 2.2222vw, 3.5rem)` | 32–56 | -0.02em | 1.08 | 560 |
| `heading` | `clamp(1.625rem, 1.3333rem + 1.2963vw, 2.5rem)` | 26–40 | -0.015em | 1.15 | 540 |
| `subhead` | `clamp(1.25rem, 1.125rem + 0.5556vw, 1.625rem)` | 20–26 | -0.01em | 1.25 | 520 |
| `lead` | `clamp(1.125rem, 1.0625rem + 0.2778vw, 1.3125rem)` | 18–21 | -0.005em | 1.45 | 400 |
| `body` | `clamp(1rem, 0.9792rem + 0.0926vw, 1.0625rem)` | 16–17 | 0 | 1.6 | 400 |
| `small` | `clamp(0.875rem, 0.8542rem + 0.0926vw, 0.9375rem)` | 14–15 | 0.005em | 1.5 | 400 |

- **Tracking and optical size work together.** Flex tightens itself as `opsz` rises, so stacking heavy negative tracking makes letters collide. At opsz 144 with -0.03em, "cr" and "de" touch. That is why the subset stops at opsz 96, and why display sits at -0.022em, inside the brief's range.
- Sentence case everywhere. No all-caps labels.
- `text-wrap: balance` on Latin headings, `text-wrap: pretty` on Hindi headings and all body copy. Balance strands a verb on Hindi lines (`specimens/hero-hi-1440.png` shows the corrected wrap).
- Measure: body 68ch, Hindi body 62ch, lead 54ch.
- Minimum text size is 14px. Form inputs are at least 16px so iOS does not zoom.
- See `specimens/type-scale-and-figures.png`.

### 4.5 Hindi

Candidates were rendered with real mixed English and Hindi lines, at display, body and phone sizes (`specimens/devanagari-comparison.png`, `specimens/devanagari-weight-tuning.png`).

Measured in em. Flex has an x-height of 0.510, a cap height of 0.716 and a stem of 0.088 at body size.

| Font | Headline height | Stem at 400 | Ratio to Flex stem | Delivery cost, weights 400–600 | Verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| **Google Sans** | **0.660** | 0.090 | **1.02** | **47 KB**, one variable file | **Chosen** |
| Noto Sans Devanagari | 0.622 | 0.081 | 0.92 | 117 KB variable | Reliable, but smaller beside Latin and over twice the size |
| Mukta | 0.630 | 0.078 | 0.89 | About 190 KB, three static files | Lighter, and its Latin-matched proportions are smaller |
| Hind | 0.642 | 0.079 | 0.90 | About 110 KB, three static files | Compact and tight next to Flex |

Google Sans wins on all three tests. Its Latin shares Flex's x-height and cap height exactly, so its Devanagari was drawn to sit with these proportions. Its headline falls between Flex's x-height and cap height, which is why mixed lines look level. Its body stem is the closest match, and it is the smallest file.

**One mismatch, and the fix.** At heading weights Flex is heavier: at weight 560 its stem is 0.122 against 0.107 for the Devanagari. English words shout inside Hindi headlines. Google Sans has a `GRAD` axis, but I tested it and it has no effect on Devanagari, so it is pinned. The fix is simple: on `/hi`, `display`, `title` and `heading` use weight 520, where the two are closer. Hindi is the majority of each line, so it sets the colour of the line.

Overrides under `:lang(hi)`:

| Step | Size | Tracking | Line height | Weight |
| --- | --- | --- | --- | --- |
| `display` | `clamp(2.25rem, 1.5rem + 3.3333vw, 4.5rem)` (36–72px) | 0 | 1.28 | 520 |
| `title` | `clamp(1.875rem, 1.4583rem + 1.8519vw, 3.125rem)` (30–50px) | 0 | 1.30 | 520 |
| `heading` | Same as English | 0 | 1.35 | 520 |
| `subhead` | Same as English | 0 | 1.45 | 520 |
| `lead` | Same as English | 0 | 1.70 | 400 |
| `body` | Same as English | 0 | 1.75 | 400 |
| `small` | Same as English | 0 | 1.70 | 400 |

- **Tracking is always 0 on Hindi.** Letter-spacing can break the headline stroke that joins letters.
- **Never put `overflow: hidden` around Hindi text.** Matras rise above and fall below the line box, and they get clipped.
- Display steps are smaller because Hindi strings run longer.
- The Hindi samples in the specimens are placeholders for testing type, not reviewed translations. Agent J owns the copy.

### 4.6 Numbers

Three separate decisions: tabular figures, grouping and units.

**Tabular digits, proportional punctuation.** Flex's `tnum` also widens `.`, `,`, the space and `₹`, which leaves `71.9` gappy at display size (see the middle column of `specimens/flex-optical-size.png`). So only digit runs are tabular:

```tsx
// <Num> wraps digit runs only. Punctuation, ₹ and units stay proportional.
const parts = text.split(/(\d+)/);
// digits -> <span className="tabular-nums">
```

```css
.tabular-nums { font-variant-numeric: tabular-nums lining-nums; }
```

Every metric on the site goes through `<Num>`, including metrics inside sentences. Digit positions stay stable during a count-up, because only digits change.

**Grouping.** Always `Intl.NumberFormat('en-IN')`, in both locales. Verified output: `1,50,000`, `4,754`, `₹1,50,000`. The `hi-IN` locale gives the same result with Latin digits, which keeps figures identical across both languages. Agent J should confirm this suits the Hindi audience. Never use `en-US` or `toLocaleString()` with no locale, which gives `150,000`.

**The ₹ Cr style.**

| Rule | Right | Wrong |
| --- | --- | --- |
| No space after ₹ | `₹71.9 Cr` | `₹ 71.9 Cr`, `Rs. 71.9` |
| Non-breaking space before the unit (U+00A0) | `₹50.2 Cr` | A line break between `50.2` and `Cr` |
| Unit is `Cr`, never spelled out in English | `₹71.9 Cr` | `₹71.9 crore`, `₹71.9Cr`, `INR 71.9 Cr` |
| Keep the decimal as stored in `metrics.ts` | `₹71.9 Cr` | `₹72 Cr` |
| Under ₹1 Cr, use the full grouped figure | `₹1,50,000` | `₹1.5 L` |

- In Hindi the unit comes from the message file as `करोड़`, because that is the word people say: `₹71.9 करोड़`. The specimens show `Cr` on Hindi lines because they were built before this decision. All units are message strings, so no code changes.
- For screen readers, `Cr` is `<span aria-hidden="true">Cr</span><span class="sr-only">crore</span>`.
- The unit is set at the same size as the figure in lists. In very large figures it can drop one step, but it stays on the baseline.

---

## 5. Spacing, grid, shape and motion tokens

All values are in `tokens.json`.

**Spacing.** 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
Section padding: `clamp(4rem, 2rem + 8.8889vw, 10rem)` (64–160px). Tight sections: `clamp(3rem, 2rem + 4.4444vw, 6rem)`.

**Grid.**

| Breakpoint | Width | Columns | Gutter | Margin |
| --- | --- | --- | --- | --- |
| base | 360+ | 4 | 16px | 16px |
| `md` | 768+ | 8 | 24px | 32px |
| `lg` | 1024+ | 12 | 24px | 48px |
| `xl` | 1280+ | 12 | 32px | 64px |
| `2xl` | 1440+ | 12 | 32px | 64px, container capped at 1312px |

Content is left-aligned by default. Centred text is limited to the 404 page.

**Radii.** Size follows role, so nothing shares one universal radius.

| Token | Value | Use |
| --- | --- | --- |
| `cell` | 2px | Gauge cells, chart bars |
| `tag` | 6px | Tags, small labels |
| `control` | 10px | Buttons, inputs |
| `panel` | 16px | Tinted panels |
| `media` | 24px | Photographs |

**Lines.**

- Hairline: 1px `hairline`. Separates list rows. On dark, `hairline-dark`.
- Emphasis: 2px `forest`, opening a table or a major list.
- Road: 3px `forest`. Reserved for the vehicle.
- Control: 1px `control`. Focus: 2px with a 2px offset.

**Shadows.** Structure comes from lines and tints, not elevation. There are only two values: `header`, a 1px line under the scrolled header, and `overlay` for menus and popovers, tinted with `deep` rather than grey. Cards and panels have no shadow.

**Motion.** From section 6.6, with no additions.

| Token | Value |
| --- | --- |
| Easing | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `press` | 200ms, `scale(0.98)` |
| `state` (hover, header) | 200ms |
| `reveal` | 400ms, opacity plus 12px rise, once |
| `draw` | 500ms, charts and lines, once |
| `count` | 500ms, once |
| Stagger | 50ms (range 40–60ms) |
| Scale entry | From 0.98, never from 0 |

Three consequences of "animate only `transform` and `opacity`". These are the easy mistakes:

| Effect | Usual way (not allowed) | Do this |
| --- | --- | --- |
| Button hover | `transition: background-color` | A `::after` overlay whose `opacity` transitions |
| Header gains a background | Transition on `background` | A pseudo-element fading in by `opacity` |
| Line draws in | `stroke-dashoffset` | Animate a `<clipPath>` rect with `transform: scaleX()` |
| Bar grows | `width` or `height` | `transform: scaleX()` with `transform-origin: left` |

Limits:

- One scroll-linked sequence per page. Only Home has one.
- No bounce, no spin, no parallax, no scroll-jacking. Wheels never rotate.
- Reveals fire once. Above-the-fold content does not reveal at all.
- `scroll-behavior: smooth` only inside `@media (prefers-reduced-motion: no-preference)`.

---

## 6. Layout patterns per page

Provisional until the sitemap is finalised after the scrape.

**Rules for every page.**

- The footer is dark and counts as one of the two dark sections. So every page has at most one other dark section.
- No row of equal cards anywhere. When content comes in threes or fours, it becomes a ruled list, a stagger or a split.
- **No page depends on photography.** See the open item in section 9: the current site has none. Each section marked "photo slot" has its fallback built in, and an empty slot renders nothing rather than a placeholder.

**The pattern library.**

| Pattern | Description | Best for |
| --- | --- | --- |
| Split 7/5 or 8/4 | Large heading and short copy beside a supporting element | Explaining one idea |
| Sticky rail | Heading sticks left (4 columns), content scrolls right (8 columns) | Several points under one claim |
| Figure list | Big number, label and source in rows, divided by hairlines | Proof |
| Index list | Full-width ruled rows, each with a name, one line and a link. The whole row is the target | Choices and navigation |
| Offset pair | Two panels of unequal width, the second set lower | Two parallel things |
| Numbered path | Vertical sequence with a connecting rule | True processes |
| Timeline | Horizontal on desktop, vertical on mobile | Company history |
| Honest chart | Directly labelled SVG with a text equivalent | Comparisons |
| Form split | Short reason to enquire on the left (5), form on the right (7) | Enquiries |

On mobile everything is a single column, in reading order.

### Home: 2 dark sections (proof band, footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Hero and lifecycle | One sticky stage (section 7) | The one showpiece |
| The battery problem | Split 7/5: heading left, recovery chart right | One claim, one honest image. Uses the 40–60% battery share and the comparison |
| Two businesses | Offset pair: Lending on mint (7 columns), Battron on `battron-tint` (5 columns), set lower | Unequal widths show one is the core and one the differentiator, and avoid a matching pair of cards |
| Proof band (dark) | Figure list on `deep`, signal for key figures | The site's one moment of weight |
| Audience paths | Index list in priority order: dealers, investors, lenders, borrowers | Four audiences would tempt four cards. Ruled rows are also larger phone targets |
| Partners and backers | Logos on a hairline-ruled grid, no card chrome, two labelled groups | Quiet proof. Logos only from the site or deck |
| CTA | Split 8/4 on `pale` | Ends on one clear next step, not a banner |

### Lending / Products: 1 dark section (footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Intro | Split 8/4, line-drawn vehicle on the right | Sets a calm tone, and borrowers land here |
| Products | Sticky rail: heading left; E-3W, E-autos and cargo (L5), E-2W and battery loans as ruled rows on the right | Comparable products without a card grid. Dealer finance added only if the scrape confirms it |
| How it works | Numbered path | A true sequence, in plain words for borrowers |
| EMI basics | Split 7/5 on `pale` | A short explanation for first-time borrowers |
| Callback form | Form split | Primary conversion for borrowers |

### Battron: 2 dark sections (proof band, footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Intro | Split 7/5 in teal ink, with the gauge | Instantly distinct from Lending |
| Custody and grading, resale, service | Sticky rail with three ruled blocks | Three services under one claim |
| Proof (dark) | Honest chart (65% against 20–25%) beside a figure list (34 days) | The strongest fact on the site gets the page's one dark band |
| Who it's for | Index list: lenders, battery makers, buyers | Three audiences, no three-card row |
| Enquiry | Form split, photo slot beside it if photos arrive | |

### Dealers & OEMs: 1 dark section (footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Intro | Split 8/4 with the 203-dealer figure as a large typographic element | Top-priority audience, so start with proof |
| Why partner | Figure list where numbers exist, ruled rows where they do not | No invented stats |
| Onboarding steps | Numbered path | A true sequence |
| Battron service | Offset panel on `battron-tint` | Introduces the second ink where it matters to dealers |
| Enquiry | Form split | Primary conversion |

### Lending partners: 1 dark section (footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Intro | Split 7/5 | Lenders read, so a text-led opening suits them |
| Co-lending | Sticky rail, with one simple SVG flow diagram | Explains structure at a high level, with no denylisted terms or numbers |
| Battron for any lender | Split 5/7 reversed, with the recovery chart | Varied rhythm. "Any lender" is written as an offer |
| Enquiry | Form split | |

### Investors: 2 dark sections (traction band, footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Story | Split 8/4 with a large opening statement | Editorial, like a letter |
| Traction (dark) | Figure list: allowlisted metrics only, each with its date and source | The page's one dark band |
| Backers | Logo row, ruled, no chrome | |
| Leadership highlights | Ruled rows with small portraits, linking to About | Avoids a row of portrait cards |
| Enquiry | Form split | |

The AUM growth line from section 6.5 needs a series of data points. Only the single AUM figure is allowlisted, so build this only if cleared points are added to `metrics.ts`. Without them the Figure list stands alone. Never draw a line from one point.

### About: 1 dark section (footer)

| Section | Pattern | Why |
| --- | --- | --- |
| Mission | Large statement, offset to column 3 | An asymmetric opening, a change of pace |
| Timeline | Timeline: 2024 Bhopal, NBFC, Battron, today | Requested in section 6.5. The road line becomes the axis |
| Leadership | Ruled rows: portrait (472px source, shown at 96–120px), name, role | Sources are too small for large portraits, and rows avoid a card grid |
| Advisor | Ruled row, same treatment | |

### Careers (only if it exists on a site): 1 dark section (footer)

Split 7/5 intro, then an index list of roles. The empty state is a sentence with a contact link. No invented openings.

### Contact: 1 dark section (footer)

Form split, with addresses, phone and Grievance Officer link in a ruled list on the left. Regulated contact details stay visible without opening a form.

### Legal and regulatory: 1 dark section (footer)

Sticky rail of 4/8 with a section index on the left, text at 68ch on the right. No decoration. Missing content uses a clearly marked placeholder. The current site also has a DLG disclosure and a refund and cancellation policy, which are not in the section 7 list. Keep both.

### 404: 1 dark section (footer)

The only centred page. The vehicle on a road with a gap in it, one plain sentence, and links to Home and to the callback form. No jokes, since a borrower may be anxious.

---

## 7. Hero and lifecycle sequence

### 7.1 Concept

**One vehicle, one stage, and it never leaves.** The hero and the lifecycle are the same sticky stage. The vehicle stands on the road on the right while the headline scrolls away on the left, and the five stages scroll past it as ordinary text.

This differs from a hero followed by a separate section, for two reasons. There is no hand-off animation, because the vehicle simply stays. And all the text is normal scrolling content, so it needs no cross-fades, keeps a natural reading order, and degrades cleanly.

Mocks: `hero-en-1440.png`, `lifecycle-desktop-stage3.png`, `lifecycle-storyboard.png`, `lifecycle-mobile-390.png`.

### 7.2 Structure

One server-rendered DOM serves every mode. CSS picks the layout, so there is no layout shift on hydration. JavaScript only adds motion.

```html
<section id="lifecycle" aria-labelledby="hero-title">
  <div class="stage" aria-hidden="true">      <!-- sticky, desktop only -->
    <svg viewBox="0 0 960 440">…</svg>        <!-- strip, vehicle, cell layer -->
    <div class="gauge">…</div>
  </div>
  <div class="story">
    <header class="hero-copy"><h1 id="hero-title">…</h1>…</header>
    <ol>
      <li data-stage="1">                     <!-- 5 of these -->
        <div class="step-scene">…</div>       <!-- static scene, shown when stacked -->
        <p>Stage 1 of 5</p>
        <h2>Finance</h2>
        <p>…</p>
      </li>
    </ol>
  </div>
</section>
```

The stage is `aria-hidden` because every fact in it is also in the text. Each `step-scene` carries a one-line `aria-label`, or is `aria-hidden` when the step text covers it.

**Which mode applies:**

| Condition | Mode |
| --- | --- |
| `(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)`, with JS | Sticky |
| Everything else | Stacked |

- 600px is tested: no collisions at 1366×640 or 1024×640, in both languages (`hero-*-1366x640.png`, `hero-*-1024x640.png`). A 1366×768 laptop has a viewport of about 640px, so it must get the sticky version.
- Zooming to 200% halves the effective height and width, so it drops to Stacked automatically.
- Without JS, `<noscript><style>` forces Stacked.
- Load the client island with `next/dynamic` only when the media query matches, so phones do not download it.

### 7.3 Desktop layout

- `.story` takes columns 1–5. `.hero-copy` is allowed to run wider, to 58% of the container, and sits above the stage with `z-index: 1`.
- `.stage` is `position: sticky; top: 72px; height: calc(100svh - 72px)`. It begins at 42% of the container and bleeds to the right edge of the viewport.
- The scene is anchored to the bottom, leaving 60px below for the gauge. The road reaches the right edge of the screen, and stops at the stage's left edge.
- The gauge sits 12px under the road, 8px in from the stage's left edge.
- `.hero-copy` has `min-height: calc(100svh - 72px)`.
- Each `<li>` has `min-height: 90svh`, with its text centred vertically.

### 7.4 Scroll mapping

```ts
const { scrollYProgress: p } = useScroll({
  target: stepsRef,                  // the <ol>
  offset: ['start center', 'end center'],
});
```

The `<li>`s are equal height, so stage boundaries are at fixed values of `p`. Each change happens over a window of ±0.03 around the boundary, then holds.

| Stage | Active `p` | Vehicle ink | Cell that fills | Gauge label (draft) | Prop | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| Before (hero) | Below 0 | Forest | None | Hidden | None | |
| 1 Finance | 0–0.2 | Forest | Cell 1, forest, at `p` 0–0.06 | Loan on file | Shopfront, loan sheet | ProsParity |
| 2 Service | 0.2–0.4 | Teal | Cell 2, teal, at 0.17–0.23 | Service history added | Bay, charger and cable | Battron |
| 3 Custody | 0.4–0.6 | Teal | Cell 3, teal, at 0.37–0.43 | Battery tested | Fence | Battron |
| 4 Resale | 0.6–0.8 | Teal | Cell 4, teal, at 0.57–0.63 | Grade certified | Grade tag | Battron |
| 5 Refinance | 0.8–1 | Forest | Cell 5, forest, at 0.77–0.83 | Grade goes with the vehicle | Dotted loop | ProsParity |

**What moves.** Five things, all `transform` or `opacity`:

| Element | Property | Mapping |
| --- | --- | --- |
| Prop strip (`<g>`, five panels 960 units apart) | `translateX` | `useTransform(p, [0, .17, .23, .37, .43, .57, .63, .77, .83, 1], [0, 0, -960, -960, -1920, -1920, -2880, -2880, -3840, -3840])` |
| Teal vehicle copy | `opacity` | 0 to 1 across 0.17–0.23, then 1 to 0 across 0.77–0.83 |
| Five vehicle cells | `opacity` | 0 to 1 across each cell's window |
| Five gauge cells | `scaleX`, origin left | 0 to 1 across the same windows |
| Refinance loop | `opacity` | 0 to 1 across 0.8–0.86 |

- **The vehicle does not move.** The world passes behind it, which reads as travel. The wheels have no spokes, so a stationary wheel looks right, and nothing needs to spin.
- The road is static and always forest.
- Two stacked vehicle copies give the ink change through `opacity`, since colour must not be animated. Share one `<symbol>`, and set `--v-ink` on each `<use>`.
- The cells sit in one layer above both copies, so they stay in sync.
- Each cell keeps the colour of the business that filled it, so the finished gauge reads forest, teal, teal, teal, forest. No recolouring is needed.
- Use `will-change: transform` on the strip only.
- Write values to elements through motion values. Do not put progress in a CSS variable on `.stage`.

**The only React state** is the active stage index, set by `useMotionValueEvent(p, 'change')` when the index changes: five updates in total, not one per frame. It swaps the gauge label, with a 200ms opacity cross-fade between two stacked spans, and sets `aria-current="step"` on the active `<li>`.

Scrolling backwards simply reverses everything, because all values derive from `p`.

**The close.** The last `<li>` ends with the deck's own line, in `subhead`: "The next owner's loan starts the loop again." The gauge stays full, the dotted loop returns to the road where stage 1 began, and the sticky stage releases normally into the next section.

### 7.5 The battery-grade indicator

**What it means.** It shows how much is known about the battery, **not charge, and not battery health**. A battery does not get healthier as it ages, so a gauge that "fills" must not suggest it. Each stage adds a record, which matches the company's argument: every loan, service job and resale adds to what is known.

**No grade letter or score appears anywhere.** The deck gives no grading method or scale, so showing "Grade A" would invent a fact.

**Two linked views of the same state:**

- In the vehicle: `#cell-1` to `#cell-5` in the pack under the rear bench, with outlined `#cell-slots` showing when empty.
- Beside it: five HTML cells of 28×12px, 4px apart, `cell` radius, with a 1px `control` outline when empty, and a text label.

Before stage 1 the pack is empty, because nothing is known before the first loan.

The label prevents colour or fill from carrying the meaning alone. The visual gauge is `aria-hidden`; each `<li>` carries the same information as text.

### 7.6 The illustration

Draft files: `hero-three-wheeler.svg`, `hero-stage-props.svg`. Inline both as components, not as `<img>`, so CSS variables reach them.

- **Style:** one continuous line weight (3 units, 2 for detail), round caps and joins, with flat `pale` panels and no shading or gradients.
- **Why it reads as an Indian e-auto:** the soft-top hood wrapping down the back, an open side with no doors, the visible bench and driver's seat, the handlebar rather than a steering wheel, the single fork-mounted front wheel under a narrow nose, rolled side curtains, a stalk mirror, and small wheels.
- **Why it reads as electric:** the battery pack under the bench and a charge port on the rear panel. There is no exhaust.
- **Three wheels in a side view:** the far rear wheel is offset and at 45% opacity.
- **Geometry:** the vehicle's own `viewBox` is `0 30 640 328.5`, so the road is flush with the bottom edge and nothing needs offsetting. Stage panels are 960×440, with the vehicle at `translate(160 40)` and the road at y=397.
- **Colour variables:** `--v-ink`, `--v-tint`, `--v-paper`, `--v-cell-lending`, `--v-cell-battron`. Line ink in Battron stages is `teal-text`, not raw teal, so it holds up on tinted backgrounds.
- **No text inside SVGs,** so all labels can be translated.
- **Layer IDs:** `road`, `far-wheel`, `steering`, `tub`, `canopy`, `rear-window`, `pillars`, `curtain`, `mirror`, `seats`, `details`, `battery`, `cell-slots`, `cells`, `wheels`.

This is a draft. It should get a designer's pass, but it is clean enough to build against, and any redraw that keeps the IDs drops straight in.

### 7.7 Mobile: stacked steps

Used below 1024px, or on any screen that does not meet the sticky condition. See `specimens/lifecycle-mobile-390.png`.

- Hero first: headline, lead, both actions, then the vehicle standing on a full-bleed road. Order is deliberate, so the headline and the action stay in the first screen.
- `.stage` is `display: none`, so `.step-scene` shows instead.
- Each `<li>` is one block, separated by a hairline: scene, gauge and label, stage name, text.
- Each scene is a static SVG with the right cells pre-filled, in the right ink, cropped to `viewBox="20 20 920 384"`.
- One `<symbol>` for the vehicle keeps the five scenes small.
- A simple reveal runs once as each `<li>` enters: opacity plus 12px rise, 400ms. No scroll-linked motion, and no `useScroll`.
- Stage text is at least 16px. There is no horizontal scroll at 360px (verified in both languages).

### 7.8 Reduced motion and no JavaScript

- The same Stacked layout, at all widths. At 1024px and above each `<li>` becomes a 7/5 split, scene beside text.
- No sticky stage, no reveals, no scroll listeners. All five scenes are visible in their final states.
- `useReducedMotion()` stops the island from mounting. The CSS media query does the layout, so the page is correct before any JS runs.
- Every fact remains available: nothing is revealed only by scrolling.

### 7.9 Stage copy (draft, for the content owner)

Based on the brief and deck. Three lines were corrected against Agent C's conflict notes.

| Stage | Draft |
| --- | --- |
| Finance | A dealer brings the loan. ProsParity underwrites it, collects it and services it. |
| Service | When a battery fault comes up, Battron, an authorised service centre, diagnoses and repairs it. |
| Custody | When a lender repossesses an EV, Battron takes custody, charges it and tests the battery. |
| Resale | The vehicle is sold to its next owner with a certified battery grade. |
| Refinance | About 3 in 4 Battron buyers take a ProsParity loan. The next owner's loan starts the loop again. |

- Service says "an authorised service centre", not "for battery makers", because there is one maker today and it is unnamed.
- Resale is deliberately passive, because the deck does not say whether Battron itself certifies the grade.
- The hero headline, "The battery decides the credit risk.", is drawn from section 1 of the brief. It replaces the current tagline, so leadership should approve it.

---

## 8. Accessibility and performance guardrails

### Accessibility (WCAG 2.2 AA)

- **Contrast:** run `contrast-check.mjs` in CI. It exits 1 on any failure. Any new pairing goes in `tokens.json` first.
- **Focus:** `:focus-visible` with a 2px outline at 2px offset, `forest` on light and `signal` on dark. Never remove it.
- **Focus not hidden:** `scroll-padding-top: calc(72px + 16px)` on `html`, so the sticky header cannot cover a focused element.
- **Targets:** 44×44px minimum, 48px for primary buttons. Whole index-list rows are clickable.
- **Skip link** first in the DOM. On route change, move focus to `main`.
- **Landmarks and headings:** one `h1` per page, with no skipped levels. `lang="hi"` on the root for `/hi`, and on any Hindi text within English pages.
- **The lifecycle** is an `<ol>` of real text. No focusable element sits inside the `aria-hidden` stage.
- **Charts:** each has a heading, direct labels and a visually hidden table. Numbers are readable before any animation.
- **Count-ups:** the final value is in the server HTML. Animate an `aria-hidden` copy, with the real value in `sr-only` text. No `aria-live`.
- **Forms:** visible labels, errors beside the field with text and an icon, an error summary that takes focus on failed submit, and correct `type` and `autocomplete`. Never placeholder-only labels.
- **Reflow:** usable at 320px and at 200% zoom.
- **Decorative SVGs** are `aria-hidden`. Meaningful ones have a `<title>` or label.
- **Hover** is never the only route to information.

### Performance

Targets from section 9: Lighthouse at least 90 on mobile, LCP under 2.5s, CLS under 0.05.

| Budget | Limit |
| --- | --- |
| Fonts, English page | 73.7 KB, preloaded |
| Fonts, Hindi page | 120.5 KB, Devanagari not preloaded |
| Inline hero and stage SVG | Under 20 KB before compression |
| Client JS for Home on mobile | No `useScroll`, and no sequence island |
| Largest image | Under 150 KB at 1440px (AVIF) |

- **LCP is the `h1` text.** It has no entry animation. Do not make the SVG or an image the LCP element.
- **Server components by default.** Only the sequence island, form logic, the locale switcher and the mobile menu are client code.
- **`LazyMotion` with `domAnimation` and `m` components,** never the full `motion` import. Load the sequence island with `next/dynamic`.
- **Do not hide content in server HTML for reveals.** Set the hidden state only after JS confirms the element is below the fold, or content disappears if JS fails and LCP suffers.
- **Reserve space:** explicit `width` and `height` on images, `aspect-ratio` on SVG wrappers.
- **Images** through `next/image`, AVIF and WebP, `sizes` set, `priority` only above the fold. No autoplay video.
- **Hindi layouts:** no fixed widths on buttons or nav items. Test with the real strings at 360px.

---

## 9. Open items

| # | Item | Why it matters | Owner |
| --- | --- | --- | --- |
| 1 | **Real photography.** The current site has none: its images are 3D fintech illustrations, which section 6.5 bans, and they should not be reused. Most are 537–739px wide. The deck's cover is a photo, which is worth checking for reuse. | Section 6.5's photo bands cannot be built. All layouts work without them, but the site would be stronger with real vehicles, dealers and service bays | Leadership to supply photos |
| 2 | **Grade scale.** No method or scale is available, so no grade is shown. | If leadership wants a visible grade, Battron must supply the real scale | Leadership |
| 3 | **Who certifies the grade.** The deck leaves this unclear. | Affects Resale copy and the Battron page | Leadership |
| 4 | **Battery maker.** One maker today, unnamed. | Copy must not imply several | Content |
| 5 | **Dealer finance.** Not in the deck. | Confirm from the scrape before listing it | Orchestrator |
| 6 | **AUM growth line.** Needs cleared data points. | Without them, the chart is dropped | Orchestrator |
| 7 | **Hero headline and stage copy** are drafts. | Replaces the current tagline | Leadership |
| 8 | **Logo.** Not reviewed here. `logo-with-text.svg` is on the scrape list. | The mocks use type as a stand-in | Phase 2 |
| 9 | **Font trademark reading.** See section 4.2. | Low risk, but should be noted at launch | Orchestrator |
| 10 | **Vehicle drawing.** Draft quality. | Worth a professional pass before launch | Design |
