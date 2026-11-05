# Asset manifest: previous redesign

Every file below was opened and looked at, not identified from its filename. Paths are relative to this folder.

**Main takeaway:** all 15 downloaded files (logos, investor logos, team photos, the PDF) are byte-identical to files already on prosparity.in, as checked by SHA-1 against `research/current-site/assets/`. The previous redesign added no new photography. All its new visuals are inline SVG drawn in code.

## Partner and backer logos

Investors, shown on `/`, `/about` and `/partners`. Each is a 303–305 × 151–152 PNG: the mark on an off-white rounded tile with transparent corners.

| File | What it shows | Link on site |
| --- | --- | --- |
| `images/investors/beenext.png` | BEENEXT wordmark in black with a chevron mark | https://www.beenext.com/ |
| `images/investors/sparrow.png` | SPARROW wordmark in black with a swift-like bird mark | https://www.sparrowvc.com/ |
| `images/investors/allin.png` | "ALL IN" in white on a red-coral waving flag | https://allincapital.vc/ |
| `images/investors/devc.png` | "DeVC" with a magenta striped V and black letters | https://www.devc.com/ |
| `images/investors/huddle.png` | HUDDLE wordmark in black, the two Ds drawn as play arrows | https://www.huddleventures.vc/ |

**Lending partners have no logo files.** Vivriti Capital, DMI Finance, Manba Finance and Namdev Finvest appear as text cards with a short code (VCL, DMI, Manba, Namdev).

## ProsParity brand

| File | What it shows | Source page |
| --- | --- | --- |
| `logo.svg` | Lockup: dark green rounded tile with a dashed inner border and a bright green "P" with an arrow, then the "ProsParity" wordmark in bright green. 153 × 35 as displayed | Every page (header) |
| `favicon.svg` | Same file as `logo.svg`, so the full lockup is the favicon | `index.html` |

The tile mark alone also appears as inline SVG. See Brand marks under Inline SVG.

## Team photos

These seven are the only real photographs on the site. All are 472 × 472 RGBA PNGs: head-and-shoulders portraits on a pale white-to-mint background. Everyone wears a black polo; where the chest is in frame it carries a green ProsParity logo.

On `/team` the founders' photos are shown with a green duotone treatment; the files themselves are full colour.

| File | Person (from page alt text) | Source pages |
| --- | --- | --- |
| `images/team/saurabh-khodke.png` | Saurabh Khodke: smiling, short dark hair, logo visible | `/about`, `/team` |
| `images/team/anirudh-dhakar.png` | Anirudh Dhakar: smiling, short greying hair, logo visible | `/about`, `/team` |
| `images/team/hakam-singh-dhakar.png` | Hakam Singh Dhakar: moustache, tight crop | `/about`, `/team` |
| `images/team/jitendra-sharma.png` | Jitendra Sharma: smiling, clean-shaven, tight crop | `/about`, `/team` |
| `images/team/kanishk-agarwal.png` | Kanishk Agarwal: smiling, younger, logo visible | `/team` |
| `images/team/sunil-dubey.png` | Sunil Dubey: moustache, tight crop | `/team` |
| `images/team/rahul-pandey.png` | Rahul Pandey: bearded, broad build, logo visible | `/team` |

## Other real photos

None. No vehicles, dealers, customers, field staff or offices are photographed anywhere on the site. Testimonials have initials, not photos.

## Documents

| File | What it is | Source page |
| --- | --- | --- |
| `pdf/ProsParity_Grievance_Redressal_Policy.pdf` | Four-page grievance redressal policy. Byte-identical to the copy on prosparity.in. The project `.gitignore` excludes `*.pdf`, so this file will not be committed | `/support`, `/legal/grievance-redressal` |

## Inline SVG

71 files in `inline-svg/`, saved from the live DOM. Lucide UI icons are excluded. Each file is named `<page-slug>-<hash>.svg`.

Most are animated in the browser, so a file is a snapshot of one frame. Near-duplicates are the same drawing at different animation frames. Some were drawn with CSS variables or masks and may look slightly different outside the page.

### Vehicles and dealership

| File | What it shows |
| --- | --- |
| `products--electric-2-wheeler-2b3ebc7cd9.svg`, `products-5bfd7ba49a.svg`, `apply-6b18ea6620.svg` | Electric scooter line art with a battery in the body, on a road |
| `products--electric-3-wheeler-cdb90b2cab.svg`, `apply-86f2d6dd53.svg`, `products--electric-2-wheeler-85adfe5a9f.svg` | Electric three-wheeler or e-rickshaw line art |
| `products--l5-cargo-c93aa85498.svg`, `products-c42738214a.svg`, `apply-c01efb518e.svg`, `products--electric-2-wheeler-f1dc2e7ac8.svg` | Cargo truck line art with a battery on the side, three wheels visible |
| `products--dealer-financing-6088039e91.svg`, `apply-29c94031b1.svg`, `products--electric-2-wheeler-92fcb53465.svg` | Dealership storefront labelled "EV · HUB", with a charging post and a vehicle in the window |
| `home-a80da5f7cb.svg` | Simple scooter or moped, Home product card |
| `home-4a8327fae5.svg` | Simple e-rickshaw, Home product card |
| `home-b3390b1f90.svg` | Simple cargo truck, Home product card |
| `home-58354cafbd.svg` | Simple shop with a ₹ sign, Home product card |
| `impact-63e081d45a.svg` | Small green electric vehicle, Impact odometer |
| `this-route-does-not-exist-5b3ecaf52f.svg` | Scooter with a low-charge bolt, 404 page |

### Diagrams

| File | What it shows |
| --- | --- |
| `network-4f39716cf2.svg` | Stylised dotted map of Madhya Pradesh, Uttar Pradesh and Chhattisgarh with glowing routes and city nodes; 99 KB |
| `home-aeb364a088.svg` | City constellation with MP, UP and CG labels |
| `network-c3890372fc.svg` | Concentric hexagonal web of nodes, Network hero |
| `technology-9a9c6bc07a.svg` | CPU-style chip with the P mark and radiating circuit traces |
| `about-1625ebf86c.svg` | Three inputs converging on ProsParity and fanning out to labelled outputs |
| `partners-fe2b738eb8.svg` | Hub diagram: P tile in the centre, lines to boxes on the left and nodes on the right |
| `how-it-works-f652464b22.svg` | Serpentine path through seven labelled stage nodes |
| `how-it-works-9f966dc03e.svg` | Zig-zag "W" path with numbered nodes, How it works hero |
| `how-it-works-4c0457df09.svg`, `how-it-works-80b588116c.svg` | Faint path fragments |
| `home-4fb5a3a741.svg` | Ecosystem connector lines from a hub to four corners |
| `home-a1882422ce.svg` | Thin trace lines across the hero, with inputs and outputs |
| `home-6fb021d4d7.svg` | Circuit-style divider trace |
| `careers-9c93e76876.svg` | Node network of circles, Careers "Reach" card |

### Dials, rings and charts

| File | What it shows |
| --- | --- |
| `technology-46eab9203b.svg`, `technology-bb5fcecaa4.svg`, `technology-85167fee0e.svg`, `technology-f7a1da3884.svg` | Four gauge dials with needles and tick marks, one per Technology stat |
| `products--dealer-financing-fffe594a6f.svg` | Large circular charge ring with tick marks |
| `products-1467eaf5b2.svg` | Thin orbit ring with three small nodes |
| `careers-249af11a7c.svg` | Circular arrow around the text "v.next" |

### News covers

Generated abstract covers, not photographs. Both types use dark teal and bright green.

| File | What it shows |
| --- | --- |
| `news--battery-swap-startups-raise-capital-ef247c2a5a.svg`, `news--ev-financing-gap-nach-mandate-94a85fe0fb.svg` | Concentric arcs with a spark |
| `news--battery-swap-startups-raise-capital-cd8fcc234e.svg`, `news--rbi-digital-lending-disclosure-norms-b3eee6028d.svg`, `news--battery-swap-startups-raise-capital-d102fe3728.svg`, `news--ev-financing-gap-nach-mandate-ce07136f10.svg`, `news-ee665309ea.svg` | Vertical bar pattern, some bars highlighted |

### Brand marks

P logo tiles at different sizes and frames: `home-8b01a82d45.svg`, `apply-dabb4479c5.svg`, `home-65f271dc73.svg`, `home-7cc1844ea1.svg`, `about-73f6f0c68a.svg`, `team-60443b923e.svg`, `this-route-does-not-exist-2e94ffe933.svg`, `about-186fa4cc6d.svg`, `about-210b3ea09c.svg`, `about-68ab0fc9f7.svg`.

`home-f8a71733f9.svg` is the P on a bright green coin, the reverse of the hero coin.

### Small illustrations

| File | What it shows |
| --- | --- |
| `home-08076cde7f.svg` | 3D-styled wheel with a bolt hub, hero object |
| `home-d879d4a14a.svg` | Battery with four cells, hero object |
| `home-13716b3ee2.svg` | Map pin with a shop inside, hero object |
| `home-091ffe3af6.svg` | Rickshaw icon, hero object |
| `home-d1f198d627.svg` | Scooter icon, hero object |
| `careers-39b4ea8357.svg` | Road with moving dot, Careers "Field" card |
| `careers-06b93090eb.svg` | One flat bar: a single frame of a stacking-bars animation on a Careers card |
| `careers-f01b3f527a.svg` | Lines of code between angle brackets, Careers "Tech" card |
| `impact-a1411a3b7f.svg` | Faint wave lines, Impact hero |
| `support-ad7242f3b4.svg` | Heartbeat line, Support hero |
| `about-a026e042bf.svg`, `news--battery-swap-startups-raise-capital-83e0436a45.svg`, `support-34997245c7.svg` | LinkedIn "in" glyph from a link button |

## Not captured

- Web fonts are not in this folder. The site loads `Google Sans Flex` and `Google Sans Code` from Google Fonts.
- `/images/*` holds only the 12 PNGs above, as far as the bundle shows. No other image path is referenced in the JS or CSS.
