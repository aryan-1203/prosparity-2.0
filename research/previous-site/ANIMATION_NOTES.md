# Animation notes: previous redesign

Source: https://prosparity-website.vercel.app/, read from the production JS and CSS bundles plus DOM inspection during the crawl on 5 Nov 2026.

**Target for the rebuild:** calm. `transform` and `opacity` only, ease-out, 200–500 ms, in-view reveals that run once, no bounce, spin or scroll-jacking, at most one scroll-linked sequence per page.

**Verdicts:** KEEP = fits the target as it stands. SIMPLIFY = keep the idea, rebuild inside the target. DROP = do not repeat.

## Summary

- Almost nothing fits the target as built. Only the legal contents marker, the accordions and the `prefers-reduced-motion` handling come close.
- **Scroll-linked effects per page:** Home has five pinned or scrubbed sections (hero, products, thesis, technology, CTA), plus velocity-linked marquees, the global progress bar and footer parallax. About has two pinned sequences and a scroll-linked CTA band. Impact has two. The target is one.
- **Pinned scroll length:** Home's four pinned sections take about 9,600 px of its 17,060 px height at 1440 px wide, so more than half of the page is scroll track. How it works pins one section for 550vh. Impact pins 320vh.
- **Timing:** the default reveal is 0.8–1.2 s on an expo curve, against a 200–500 ms target. Count-ups run 2.2 s. The preloader holds the first visit for about 3.9 s.
- **Looping motion never stops:** every section label pulses, and most diagrams have packets running along wires, rotating rings or breathing glows.

## Stack in use

| Tool | Where | Notes |
| --- | --- | --- |
| Motion (Framer Motion) | Everywhere | `whileInView`, `useScroll`, `useSpring`, `useTransform`, `useVelocity`, `useAnimationFrame`, `AnimatePresence`, `layoutId`, `drag` |
| Lenis 1.3.26 | Global | Smooth scroll, `lerp: 0.1`, `smoothWheel: true`, off under reduced motion |
| SVG SMIL | Diagrams | `<animateMotion>` and `<animate>` with `repeatCount="indefinite"` for packets along paths |
| Tailwind keyframes | Global | Only `ping`, `pulse` and `spin` exist in the CSS |
| CSS transitions | Hover states | Mostly `duration-500`/`700`; one `duration-[1400ms]` wheel spin |

No GSAP, Three.js, Lottie or canvas. The 3D look comes from CSS `preserve-3d`.

Custom easings: `outExpo [.16,1,.3,1]`, `inOutCirc [.85,0,.15,1]`, `outBack [.34,1.56,.64,1]` (overshoots, so it counts as bounce). Default spring: stiffness 180, damping 22.

Worth carrying over: a reduced-motion hook is used throughout, and the CSS clamps animation and transition durations under `prefers-reduced-motion`. Several sections have a separate static layout for it.

## Global, on every page

| Element | How it animates | Against target | Verdict |
| --- | --- | --- | --- |
| Preloader | First visit per tab (`sessionStorage pp-loaded`). Scroll locked, 2.9 s hold, then 1 s split-panel exit. Logo draws by `pathLength`, 000–100 mono counter, cycling "Credit flows to…" word, blur exit, `outBack` logo with rotate | Blocks content; blur, overshoot, far too long | DROP |
| Route transition | Lime wipe (0.5 s) and dark panel with page title (0.75 s), then main fades up 40 px over 0.8 s after a 0.25 s delay, `AnimatePresence mode="wait"` | About 1 s or more on each navigation | DROP |
| Lenis smooth scroll | Replaces native wheel scrolling | Scroll-jacking | DROP |
| Scroll progress bar | 2 px fixed bar, `scaleX` on a spring | Scroll-linked on every page, counts against the one allowed | DROP |
| Header | Hides on scroll down (`y -130%`, 0.5 s). Shrinks with `transition-all` on `max-width` and padding, adds `backdrop-blur-xl` | Layout properties, blur | SIMPLIFY: fixed header, or transform-only hide at 200–300 ms |
| Desktop mega menu | Opacity, `y`, `scale`, `filter: blur(6px)`, 0.35 s; items stagger in from the left | Blur | SIMPLIFY: opacity and small `y`, 200 ms, no stagger |
| Mobile menu | `clip-path` circle over 0.7 s, then links stagger up | `clip-path`, long | SIMPLIFY: opacity and transform, 250 ms |
| Announcement bar | Animates `height` | Layout property | SIMPLIFY: static, dismiss with no height animation |
| Section label | `animate-ping` dot (infinite) + `( 01 )` index + scramble text | Infinite; scramble swaps text through random glyphs for 700 ms and again on hover | DROP |
| Split-text headings | Each word or character slides up 110% with 4–8° rotate, 0.9 s, 0.06 s stagger | Rotation, long | SIMPLIFY: whole heading fades up 12–16 px, 300–400 ms, once |
| Accent words | `filter: blur(12px)` to 0 over 1 s | Blur | DROP |
| Default reveal | `opacity` + `y 30–60`, 0.8–1.2 s, once, margin −12% | Correct idea, too slow and too far | SIMPLIFY: the one worth keeping, at 300–500 ms and 12–16 px |
| Count-ups | Text count 0 to value, 2.2 s; used for every headline stat | Not transform or opacity; 2.2 s | DROP: static numbers inside a normal reveal |
| Magnetic buttons | Every CTA follows the cursor on a spring (stiffness 220, damping 15) | Bounce | DROP |
| Button fill | Colour panel slides up, arrow swaps diagonally, 0.5 s; `whileTap` scale 0.96 | Slow | SIMPLIFY: colour change and arrow nudge at 200 ms; keep the tap scale |
| Marquee | Infinite, speeds up and reverses with scroll velocity. In the footer, Home, Network, Partners, About | Infinite, reacts to scroll | DROP: use a static row |
| Page hero | Scan line sweeps down (1.8 s), giant outlined word drifts with scroll, hero content fades and shifts with scroll | Two scroll-linked effects before the page starts | SIMPLIFY: static hero, one fade-up |
| Banner visuals | Looping animated SVG in each page hero: orbits, packets, flicker, spinning wheels | Infinite motion | DROP the loops; a static illustration can stay |
| Circuit divider | Green trace draws with scroll (`pathLength`) | Scroll-linked, techy | DROP |
| CTA band | Clip reveal and scroll-linked ghost word, battery cells rise with `outBack` | Scroll-linked, overshoot | SIMPLIFY: static band |
| Footer | Giant outlined `prosparity` parallax | Scroll-linked, decorative | DROP |
| Tilt cards | 3D `rotateX/Y` follows the pointer with glare (Home, Impact, Careers) | Spring, 3D | DROP |
| Dialogs | `layoutId` shared-element morph, 0.6 s | Long, layout-driven | SIMPLIFY: fade and scale 0.98 to 1, 250 ms |

## Per page

### Home `/`

| Section | How it animates | Verdict |
| --- | --- | --- |
| Hero (300vh pinned; 240svh on mobile) | 12 CSS-3D objects (wheel, battery, coins, bolts, pin, scooter, rickshaw, tiles) float, follow the mouse and spin into the logo, which draws itself. Shockwave ring, traces with packets, per-word `rotateX` exit, second headline, "Scroll to charge 000" ring. Objects enter on a spring with damping 14 | DROP: this is the core of the rejected look |
| Who we connect | Two skewed marquees at −2° and 1.5°, opposite directions | DROP |
| Products | Pinned horizontal scroll (height `calc(100vh + track)`), tilt cards, wheels rotate 360° on hover | DROP: use a plain grid with a reveal |
| Thesis (260vh pinned) | Words go from opacity 0.12 to 1 with `y` and blur as you scroll; Digital and Physical rails slide in from ±40vw | SIMPLIFY: best candidate for Home's single scroll-linked sequence, using opacity only, no blur, shorter or unpinned |
| Ecosystem | Auto-advances every 3.6 s; rotating ring (60 s), `animateMotion` packets, pulsing logo glow, blur swap | SIMPLIFY: static diagram, user-driven tabs |
| Impact battery | Five cells fill by `clip-path` in sequence, count-ups, "Charge 0–100%" counter | SIMPLIFY: five plain stat tiles |
| Network | City dots spring in (damping 14), packets, hover switches state | SIMPLIFY: static map with hover colour only |
| Technology (240vh pinned, desktop) | Three cards fan out with `x`, `y`, `rotate`, `rotateY` | DROP: three static cards |
| Voices | Draggable card stack, rotation, spring | SIMPLIFY: plain cards, or arrows with a crossfade |
| Backed by | Logos flip in from `rotateX −40°`; partner top line draws 1.2 s; bars | SIMPLIFY: fade-up |
| Newsroom | Hover overlay and generative cover | SIMPLIFY: hover colour only |
| CTA | Radial glow scales 0.3 to 1.25 with scroll, type slides in from ±30%, rotating text ring (18 s) | DROP |

### Products `/products`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero | Rings rotate (60 s and 40 s), product cycles every 2.6 s with blur | DROP |
| Pick your ride | Switcher auto-advances, drag, arrow keys, `layoutId` pill, blur swap | SIMPLIFY: tabs, no auto-advance, no drag |
| Side by side | Range bars reveal by `clip-path` on a spring with a looping shimmer | SIMPLIFY: static bars or a table |
| Who it's for | Outlined "Bharat" drifts for 30 s, chips spring in from scale 0.6 | SIMPLIFY: static chips |

### Product detail `/products/*` (four pages, one template)

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero vehicle | Wheels spin at 0.9 s per turn, road dashes, speed lines, flicker, "Charged 100%" | DROP the loops; keep a still vehicle if illustrations stay |
| Why it works | Check marks spring in (damping 15) with rotate, on a timed sequence | SIMPLIFY: static list |
| EMI calculator | Rolling digits on a spring, ring and per-EMI bars on springs | SIMPLIFY: keep the calculator, update instantly |
| Journey | Line draws with scroll, nodes step on | SIMPLIFY: static four steps |
| Eligibility | Cards flip from `rotateX −70°` | SIMPLIFY: fade-up |
| Sticky apply bar | Slides up on a spring | SIMPLIFY: 250 ms ease-out |

### Apply `/apply`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Question transition | Slides 80 px with blur, auto-advances 320 ms after a pick | SIMPLIFY: 200–300 ms fade and small `x`, no blur |
| Progress segments | Current segment pulses in a loop | SIMPLIFY: static fill |
| Success | Logo charges, three rings pulse (2.4 s loop), reference number scrambles | DROP the rings and scramble; keep a plain confirmation |

### How it works `/how-it-works`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Seven stages (pinned, height 550vh) | Serpentine SVG path with a glowing packet, stage cards swap with `rotateX`, pulsing node | SIMPLIFY: a fair choice for the page's one scroll-linked sequence, but much shorter and without the glow. A static numbered list is the safer option |
| Stat rings | Rings draw, count-ups | SIMPLIFY: static |

### Technology `/technology`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero | CPU-style chip with circuit traces, packets, 5 s bob, expanding ring | DROP: the most literal "too techy" image on the site |
| Gauges | Needles swing on a spring (stiffness 40, damping 9), so they overshoot | DROP |
| Three systems | Isometric 3D layer stack spreads with scroll, tap to pull a layer out | DROP |
| Collections console | Fake app window auto-cycles nine modules, each with its own looping demo (scanning, rotating, ticking, chat bubbles on a spring) | DROP: if the content stays, use a plain list of nine modules |

### Network `/network`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero | Rotating rings (80 s and up), ping circles, dots spring in (damping 14–15), packets | DROP |
| Live map | City pings, packets on routes, panel swaps with `rotateX`, `layoutId` pills | SIMPLIFY: static map, state tabs with a crossfade |
| Timeline | Line draws with scroll, square rotates on a 3 s loop, milestones spring in (damping 12) | SIMPLIFY: static timeline |
| City marquee | Infinite | DROP: static list |

### Impact `/impact`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero | Falling leaf particles rotate 360° on a loop; wave paths morph `d` forever | DROP: `d` morphing is not transform or opacity |
| Odometer (320vh pinned) | Digit reels, road scrolling, vehicle driving, trees, CO₂ counter, comparison bars, all scroll-linked | SIMPLIFY: at most the page's one sequence. Static figures are safer, because mid-scroll frames show numbers the site never claims |
| Why it matters | Word-by-word opacity scrub | SIMPLIFY: plain text. It is a second scroll-linked effect on this page |
| Livelihoods | Tilt cards with looping ring pulses | DROP the tilt and rings; fade-up only |

### Partners `/partners`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero | Hub diagram: paths draw, packets, nodes spring in (damping 14), pulsing ring | DROP the loops |
| Who we work with | Orbit rings rotate, tile pops with spring and rotate, chips spring in (damping 16) | SIMPLIFY: tabs with crossfade |
| Lending structures | Share bars fill; a shimmer sweeps on a loop; arrows pulse on a loop | SIMPLIFY: static bars |
| Lending partners | Card line draws; marquee | SIMPLIFY: static grid |
| Form success | Check draws on a spring | SIMPLIFY: 300 ms fade |

### About `/about`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Mission (240vh pinned) | Word-by-word reveal with a percentage counter | SIMPLIFY: either this or the thesis as the one sequence, not both |
| Thesis (260vh pinned) | Two halves slide together with a `clip-path` reveal | DROP: two static columns |
| Values | Reveal stagger | SIMPLIFY: faster |
| Founders | Cards tilt on hover (`whileHover` rotate ±2°) on a spring | SIMPLIFY: no rotation |

### Team `/team`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero | Code places founder photos on a ring orbiting a pulsing logo every 70 s, counter-rotated; at capture they showed only as small dots | DROP |
| Cards | Hover overlay; `layoutId` morph into a dialog (0.6 s) | SIMPLIFY: plain dialog fade |

### Careers `/careers`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Life at ProsParity | Draggable strip of five looping SVG cards; one uses `outBack` in a loop | SIMPLIFY: static cards, no drag |
| Values | Pointer tilt with a radial spotlight | DROP |
| Open roles | Accordion, icon rotates 45° on a spring | KEEP the accordion, with a 200 ms ease-out icon |

### News `/news`, articles `/news/*`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Hero, covers | Floating generative covers on a 6 s bob; a spark loops along each cover | DROP the loops; static covers |
| Filter | List re-sorts with a spring | SIMPLIFY: 200 ms fade |
| Subscribe success | Icon spins in on a spring (damping 14) | SIMPLIFY |
| Article | Cover parallax, reading-progress ring, drop-cap reveal, `clip-path` | SIMPLIFY: keep only a thin reading-progress bar if wanted |

### Support `/support`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Quick actions | `layoutId` background, icon rotate on hover | SIMPLIFY: colour only |
| FAQ | Accordion; list filter | KEEP the accordion, at 200–300 ms |
| Grievance ladder | Line draws with scroll | SIMPLIFY: static. People arriving here are unhappy; it should read instantly |

### Legal `/legal/*`

| Element | How it animates | Verdict |
| --- | --- | --- |
| Contents marker | Active bar slides with `layoutId` | KEEP, or swap to an instant colour change |
| Reveals | Fade-up | SIMPLIFY: faster, or none |

### 404

| Element | How it animates | Verdict |
| --- | --- | --- |
| "lost" and vehicle | Glitch slices via `clip-path`, battery drains, vehicle shakes, wheels spin | DROP |

## What reads as "too techy"

### Colour and surface

- Near-black green `#001C06` and `#061C23` as the default page background, with neon `#3BFE7B` as the main accent. This is the dark terminal or crypto-dashboard look.
- Neon glows: `.glow-volt`, `shadow-[0_0_12px_#3BFE7B]`, `blur-3xl` halos, radial green washes.
- Dot-grid backgrounds on almost every section, plus a noise `.grain` overlay.
- `.tile` cards with a 1 px dashed inner border, like a circuit-board outline.

### Type and labels

- Giant outlined ghost words behind content ("Bharat · Bijli · Bharat", "prosparity", the page name).
- Uppercase, wide-tracked micro-labels, and `Google Sans Code` monospace for figures.
- Numbered section tags in brackets: `( 01 )`, `( 06.2 )`, `( § )`, `( → )`.
- Scrambling text and percentage load counters.

### Motifs

- Circuit traces, a CPU chip, data packets running along wires, node graphs, constellation maps.
- An app-window mock with a path breadcrumb (`collections / borrower 360`), `⌘K` search, and a `PAUSED` status chip.
- Gauges, odometers, battery cells, and pulsing status dots.
- Line-art vehicles rather than photographs. The only real photos on the site are the seven team portraits.

### Copy and jargon

Electrical metaphors everywhere, aimed at engineers rather than a borrower or a lender:

- "Plug into the EV credit grid." / "One platform, three sockets." / "Let's wire you in."
- "Other circuits." / "Also on the grid" / "Signals from the grid." / "Tune the frequency." / "Fresh off the wire."
- "Numbers that hold under load." / "Slide. Watch it recharge." / "Start charging" / "Scroll to charge"
- "Rule changes ship within a sprint, not a support ticket." / "Inside the stack" / "Half field, half code."

Unexplained industry terms: LOS / LMS, e-NACH, PTP, thin-file, bureau, sourcing, allocation engine, 100–0, 80–20.

### Interaction

- Instructions the visitor has to read before using the page: "Scroll to charge", "Drag the card ←→", "Tap a layer to pull it out.", "Hover to pause · Arrow keys to switch", "← → to switch", "scroll to move the credit".

## Defects seen while inspecting

Recorded so nobody copies them.

- **Home, 1440 px:** the "Cities" counter stays at 0 and "Charge" at 0%, while neighbouring counters finish. Reproduced with real wheel scrolling through Lenis. Both read correctly at 390 px (22 and 100%). Cause not established.
- **Network:** the heading renders as "State by state, year by". The source title is "State by state, year by year." with accent word "year"; the title is split on that word and the third part is dropped.
- **Spacing:** "Signals from the grid ." and "We're on it ." have a space before the full stop in the DOM. On the News hero at 1440 px, the full stop wraps onto its own line.
- **All pages:** `document.title` never changes from the default, and no page has its own meta description.
- **Forms and data:** the site calls `/api/*`, but GET requests there return the SPA's `index.html`, so content falls back to data inside the bundle. Form submissions were not tested.
- **Articles:** all three bodies read "Placeholder article body. Replace via the admin/database."
