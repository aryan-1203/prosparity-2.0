# Open items before launch

Nothing here blocks local review. All of it should be closed before the site goes live.

## Legal and regulatory: needs the company

Legal pages carry the text from prosparity.in unchanged, so its existing problems carry over. They need a lawyer's review.

| Item | Where it shows | Note |
| --- | --- | --- |
| Registered office | Contact, NBFC details | The current site gives two: Navi Mumbai (Terms, Privacy) and Bhopal (policy PDF). Marked placeholder |
| CIN, RBI registration number and category | NBFC details | Not on the site or in company material. Marked placeholder |
| Fair Practices Code | `/legal/fair-practices-code` | Not published anywhere. Marked placeholder |
| Full list of regulated entities | `/legal/lending-partners` | The site lists Vivriti, DMI, Manba and Namdev. Company material names Vivriti, DMI, Manba, Ecofy and Singularity AMC. The sixth partner is unnamed. Namdev may be the sixth, or a former partner |
| "Not engaged in grant of loan" | Terms | Contradicts lending through the company's own NBFC since March 2026 |
| Minimum age | Terms, Privacy | Terms say 21, Privacy says 18 |
| "Schedule 1" | Terms | Cited, but does not exist on the page |
| Which entity runs the site | All legal pages | Relationship between Etribe Finance, Battron's entity and any parent is unconfirmed |
| Grievance complaint form | Grievance page | The form on prosparity.in never sent anything, so it was removed. Email and escalation details remain. Decide whether to add a real one |
| Hindi legal text | All legal pages | Shown in English with a Hindi notice. Machine-style legal translation is a risk, so this needs a qualified translator |

## India map: check before launch

| Item | Note |
| --- | --- |
| Official boundaries | Maps of India published in India must show the official boundaries. Have the Network map checked against Survey of India before launch |
| Data licence | The boundaries come from the public `udit-001/india-maps-data` repository, which says its data was curated from public sources and has no clear licence. Replace it with a licensed source if legal asks. `scripts/build-india-map.py` rebuilds the map from any TopoJSON |

## Left out of the previous redesign on purpose

Its pages and routes are all here, but these claims failed the rules in the brief.

| Removed | Why |
| --- | --- |
| Interest rates, loan sizes and tenures | Not allowlisted or verified. The EMI calculator therefore starts empty and holds no company rates. Supply real ranges to show them |
| 22 cities, 147 dealers, 33,390 accounts | Contradict company figures of 27 cities, 203 dealers and 4,754 loans |
| The list of named cities | Unverified. The company has not named its cities |
| 96.4% collection efficiency and other technology figures | Sign-off item, or unverified |
| 412M km, 20,000T CO2, 48-hour disbursal, same-day approval | Not allowlisted |
| Customer testimonials | Named people that cannot be verified. Real, consented quotes would be welcome |
| Five open job roles | Cannot be verified. Careers invites open applications |
| News bylines and the battery-swap story | The bylines appear invented and all three bodies were placeholders. Two stories were rewritten in full and the third replaced |

## Copy from the previous redesign to confirm

Used because it describes how the company works, but no other source confirms it.

- Technology: the three systems and nine collections modules, and "built in-house".
- Borrowers: "no salary slip needed", the document list, the field visit, and "fast repeat loans".
- Payments: e-NACH, UPI and payment links. WhatsApp reminders are mentioned on the Technology page.
- Partners: origination, co-lending and term debt as the structures on offer. The percentages were removed.
- Dealer financing for "inventory and working capital".

## Newsroom

| Item | Note |
| --- | --- |
| Pre-seed story | Links to press coverage that states the amount. The site itself shows no amount, but leadership should approve linking to it |
| Two-wheeler subsidy story | July 2026 reports said this subsidy was ending, and August reports said it was extended. Check the notification before launch |
| Dates | Shown by month. Dates for company stories come from company material, and those for external stories are approximate |
| Company stories | NBFC licence, Battron launch and product dates are drawn from company material. Confirm each is public |
| Keeping it current | Stories live in `frontend/content/news.ts` and the message files. There is no admin screen, so each new story needs a code change |

## Sign-off: needs leadership

| Item | Note |
| --- | --- |
| Held metrics | Collection efficiency, gross NPA and PAR figures are not on the site and not in the repository. Add them to `content/metrics.ts` only after sign-off |
| Battery share of EV cost | Allowlisted, but the brief requires a public source and none is named. Left off until one is supplied |
| Page headlines | Every page headline was rewritten in a friendlier voice, led by "Good batteries make good loans." The current tagline now sits in the About intro. Leadership should approve them |
| Hero and stage copy | Drafted from the brief and company material |
| Dealer onboarding steps and "faster approvals" | Steps are generic. Confirm they match how onboarding works |
| Borrower "how it works" steps and EMI text | General wording. Confirm with the credit team |
| Battery grade | Who certifies it, and whether a grade scale can be shown |
| Product names | Whether customers should see "E-3W", "e-auto" and "E-rickshaw" |

## Content and assets

- **Contact email:** the site uses help@prosparity.in throughout, as most of prosparity.in does. The Terms still say hello@prosparity.in, because legal text is unchanged.
- **Investors page:** this is no longer in the main menu. It stays in the footer so the investor form and backers keep a home.
- **Battron:** the internal page was replaced by a link to battron.in. Battery-maker enquiries moved to Partners.
- **Uttar Pradesh line:** "one of India's biggest markets for electric three-wheelers" is qualitative. The figures behind it are held.

| Item | Note |
| --- | --- |
| Photography | None exists. Layouts work without it, but real vehicles, dealers and service bays would lift the site |
| Team | Hakam Singh Dhakar and Jitendra Sharma are shown as cofounders with their company-material roles, because prosparity.in calls them cofounders and company material does not. Confirm this. Harendra Singh Matiyali's full name comes from his LinkedIn address, so confirm the spelling and whether he prefers Harry. His and Anuj Jain's photos came from small screenshots, so higher-resolution originals would look sharper. Girish Chawla has no photo and uses an initial |
| Logos | Ecofy and Singularity AMC appear as text because no logo is available. Backer logos have a grey background baked in, so cleaner files would help |
| ProsParity logo | The wordmark was recoloured from signal green to forest for use on white. Confirm with brand owner |
| Hindi | All strings need a native-speaker review: `docs/HINDI_REVIEW.md` |
| "About 3 in 4" | Lives in the message files, not `metrics.ts`, because the two languages word it differently |

## Engineering

| Item | Note |
| --- | --- |
| Postgres | Not installed on the build machine, so migrations and forms were tested on SQLite only. Run against Postgres 16 before launch |
| docker-compose | Written but not run, because Docker is not installed on the build machine |
| Email | Not tested against a real provider or mail catcher. The failure path is covered by a test |
| Turnstile | Code is in place, but not tested with real keys |
| Rate limiter | In memory, so it needs Redis if the API runs more than one instance |
| LCP | 2.4 to 2.8 s on simulated mobile, against a target of under 2.5 s. It rose as pages grew. Re-measure on the real host. The remaining cost is the font swap, which `font-display: optional` would remove |
| Screen reader pass | Not done. Lighthouse accessibility is 100 and keyboard order was spot-checked, but no axe run or manual screen reader test has been done |
