# Sitemap: previous redesign

Site: https://prosparity-website.vercel.app/ (Vite + React SPA, crawled 5 Nov 2026).

25 pages plus a 404 state. Routes come from the React Router table in the JS bundle, and from the slugs in its data. Every route in the bundle is also linked from a rendered page, so there are no unlinked pages. `robots.txt` and `sitemap.xml` do not exist: both URLs return the SPA's `index.html`.

## Route table

| Route | Page file | Linked from |
| --- | --- | --- |
| `/` | `pages/home.md` | Header logo, all pages |
| `/products` | `pages/products.md` | Header, footer |
| `/products/electric-2-wheeler` | `pages/products--electric-2-wheeler.md` | Header, footer |
| `/products/electric-3-wheeler` | `pages/products--electric-3-wheeler.md` | Header, footer |
| `/products/l5-cargo` | `pages/products--l5-cargo.md` | Header, footer |
| `/products/dealer-financing` | `pages/products--dealer-financing.md` | Header, footer |
| `/apply` | `pages/apply.md` | Header CTA, footer |
| `/how-it-works` | `pages/how-it-works.md` | Header, footer |
| `/technology` | `pages/technology.md` | Header, footer |
| `/network` | `pages/network.md` | Header, footer, announcement bar |
| `/impact` | `pages/impact.md` | Header, footer |
| `/partners` | `pages/partners.md` | Header, footer ("Partners & Lenders") |
| `/about` | `pages/about.md` | Header, footer |
| `/team` | `pages/team.md` | Header, footer |
| `/careers` | `pages/careers.md` | Header, footer |
| `/news` | `pages/news.md` | Header, footer ("Newsroom") |
| `/news/ev-financing-gap-nach-mandate` | `pages/news--ev-financing-gap-nach-mandate.md` | Home, News |
| `/news/rbi-digital-lending-disclosure-norms` | `pages/news--rbi-digital-lending-disclosure-norms.md` | Home, News |
| `/news/battery-swap-startups-raise-capital` | `pages/news--battery-swap-startups-raise-capital.md` | Home, News |
| `/support` | `pages/support.md` | Header, footer |
| `/legal/privacy-policy` | `pages/legal--privacy-policy.md` | Footer |
| `/legal/terms-and-conditions` | `pages/legal--terms-and-conditions.md` | Footer |
| `/legal/dlg-disclosure` | `pages/legal--dlg-disclosure.md` | Footer |
| `/legal/refund-and-cancellation-policy` | `pages/legal--refund-and-cancellation-policy.md` | Footer |
| `/legal/grievance-redressal` | `pages/legal--grievance-redressal.md` | Footer, Support |
| any other path | `pages/this-route-does-not-exist.md` | Not linked (404 state) |

Header and footer text is in `pages/_site-chrome.md`.

Other notes:

- `/apply?product=<slug>` is a state of `/apply`: it preselects the product and starts at question 2.
- `/support#grievance` jumps to the Grievance redressal section of Support.
- `/api/*` paths in the bundle are data endpoints, not pages. See SUMMARY.md.

## Navigation

- **Announcement bar:** "Now live in 22 cities across MP, UP & Chhattisgarh." with a link to the network page.
- **Header:** Products, Platform and Company dropdowns, Support, and an "Apply for finance" CTA.
- **Footer:** service marquee, newsletter, the three nav groups, Reach us, legal links, giant wordmark.

## Pages and sections

### Home `/`

1. **Hero:** pinned sequence with two headlines, "Reimagining credit for electric Bharat" and "Credit that flows like current." States the proposition, gives Apply and How it works CTAs.
2. **Who we connect:** two marquees naming the parties and the four products.
3. **Products:** four cards with rate and ticket range, routes to each product.
4. **Our thesis:** one statement of why digital plus physical lending wins.
5. **One platform, four sides:** what ProsParity offers OEMs, dealers, lenders and customers.
6. **Impact:** five headline stats in a battery graphic.
7. **Network:** state summary with a constellation map, routes to Network.
8. **Technology:** collections platform claim, 96.4% stat, three system cards.
9. **Voices:** four testimonials.
10. **Backed by:** investors, lending partners and the three lending models.
11. **Newsroom:** three latest stories.
12. **CTA:** "Your EV future awaits", to Apply or Support.

### Products `/products`

1. **Hero:** "Finance that moves at the speed of electric". Sets the scope, CTAs to eligibility and How it works.
2. **Pick your ride:** switcher showing each product's ticket, tenure, rate and audience.
3. **Side by side:** compares ticket size and tenure across the four.
4. **Who it's for:** audience chips, filtered by product, each linking to its product.
5. **CTA:** "Five questions. One call. On the road."

### Product detail `/products/*`

Four pages on one template, for Electric 2 Wheeler, Electric 3 Wheeler, L5 Cargo Loader and Dealer Financing.

1. **Hero:** name, tagline, ticket, tenure and rate, Apply and Calculate EMI actions.
2. **Why it works:** four product benefits.
3. **EMI calculator:** loan amount and tenure sliders with an indicative EMI, principal and interest.
4. **The journey:** four steps from showroom to road. The wording changes on Dealer Financing.
5. **Eligibility:** documents needed.
6. **Also on the grid:** cross-links to the other three products.
7. **CTA:** apply now or see all products.

### Apply `/apply`

1. **Hero:** "Five questions. Zero paperwork."
2. **Application flow:** five steps covering product, occupation, income, budget or credit need, and contact details, then a success state. This is a lead form, not a loan application.
3. **CTA:** "Compare first. Apply when ready."

### How it works `/how-it-works`

1. **Hero:** "Digital alone can't see. Physical alone can't scale."
2. **The seven stages:** the path from lender capital to collection, each stage tagged Digital or Physical.
3. **In numbers:** two operating stats.
4. **Your move:** route to Apply or Technology.

### Technology `/technology`

1. **Hero:** "Built in-house, not licensed."
2. **Performance:** four collections stats on gauges.
3. **Architecture:** three systems: Sourcing, Credit, Core.
4. **Collections console:** nine modules in a mock app window.
5. **CTA:** aimed at capital partners, "Plug your capital into our stack."

### Network `/network`

1. **Hero:** "22 cities. One current."
2. **Live map:** per-state cities, dealers, accounts and city list, plus totals.
3. **City marquee:** all 22 cities.
4. **Expansion:** timeline of state launches.
5. **CTA:** aimed at dealers, "Bring financing to your showroom."

### Impact `/impact`

1. **Hero:** "Empowering sustainable mobility by doing our bit"
2. **Odometer:** electric kilometres and CO₂ avoided, with a petrol versus electric comparison.
3. **Why it matters:** three sustainability statements.
4. **Livelihoods:** thin-file borrowers, first-time borrowers, livelihoods.
5. **CTA:** "Your next mile can be electric."

### Partners `/partners`

1. **Hero:** "Plug into the EV credit grid."
2. **Who we work with:** tabs for lenders, dealers and OEMs, each with an enquiry action.
3. **Lending structures:** 100–0 origination, 80–20 co-lending, term debt.
4. **Lending partners:** four named lenders and a marquee.
5. **Backed by:** investor logos.
6. **Partner enquiry:** form plus email.
7. **CTA:** to Technology and Network.

### About `/about`

1. **Hero:** "Credit, rewired for Bharat."
2. **Mission:** the mission statement.
3. **The thesis:** digital-only versus physical-only, "We do both."
4. **Values:** Field-first, Own the full life, Impact compounding.
5. **Origin:** founders' experience, and a marquee of past employers.
6. **Founders:** four cards linking to Team.
7. **Backed by:** investor logos.
8. **CTA:** partner with us or join the team.

### Team `/team`

1. **Hero:** "Operators who've financed Bharat."
2. **Founders:** four portrait cards opening full bios, "60+ years" stat.
3. **Core team:** three members, plus an open-seat card to Careers.
4. **CTA:** hiring.

### Careers `/careers`

1. **Hero:** "Build the electric credit rail."
2. **How we work:** the same three values as About.
3. **Open roles:** five roles with team filters, an accordion and an application dialog.
4. **Life at ProsParity:** five themed cards.
5. **Open application:** email for speculative CVs.

### News `/news`

1. **Hero:** "Signals from the grid ."
2. **Latest:** featured story.
3. **All stories:** filterable list of three.
4. **Newsletter:** sign-up form.
5. **Press:** contact for press.

### News article `/news/*`

Three pages on one template.

1. **Article:** category, date, read time, title, author, standfirst, body, share actions. The body is placeholder text.
2. **Keep reading:** the other two stories.
3. **CTA:** to all stories or Support.

### Support `/support`

1. **Hero:** "We're on it ."
2. **Quick actions:** Pay EMI, Loan status, Update details, Grievance.
3. **FAQ:** seven questions with search and category filters.
4. **Contact:** email, registered office, LinkedIn, and a ticket form.
5. **Grievance redressal:** three internal levels and the RBI Ombudsman, nodal officer details, RBI portals.
6. **CTA:** apply or explore products.

### Legal `/legal/*`

Five pages on one template: title, document tabs, contents list, numbered sections, and a contact footer. The disclosure page is one table; the other four are long-form text.

### 404

"We seem lost!" with links home and to Support.
