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

## Sign-off: needs leadership

| Item | Note |
| --- | --- |
| Held metrics | Collection efficiency, gross NPA and PAR figures are not on the site and not in the repository. Add them to `content/metrics.ts` only after sign-off |
| Battery share of EV cost | Allowlisted, but the brief requires a public source and none is named. Left off until one is supplied |
| Hero headline | "The battery decides the credit risk." replaces the current tagline, which now sits on About |
| Hero and stage copy | Drafted from the brief and company material |
| Dealer onboarding steps and "faster approvals" | Steps are generic. Confirm they match how onboarding works |
| Borrower "how it works" steps and EMI text | General wording. Confirm with the credit team |
| Battery grade | Who certifies it, and whether a grade scale can be shown |
| Product names | Whether customers should see "E-3W", "e-auto" and "E-rickshaw" |

## Content and assets

| Item | Note |
| --- | --- |
| Photography | None exists. Layouts work without it, but real vehicles, dealers and service bays would lift the site |
| Team | Roles follow company material and differ from prosparity.in. Anuj Jain, Harry and Girish Chawla have no photo and use an initial. Harry needs a surname. Sunil Dubey and Rahul Pandey appear on the current site but not here |
| Logos | Ecofy and Singularity AMC appear as text because no logo is available. Backer logos have a grey background baked in, so cleaner files would help |
| ProsParity logo | The wordmark was recoloured from signal green to forest for use on white. Confirm with brand owner |
| Hindi | All strings need a native-speaker review: `docs/HINDI_REVIEW.md` |
| "About 3 in 4" | Lives in the message files, not `metrics.ts`, because the two languages word it differently |
| Market figure source | The exact article behind the FY26 three-wheeler share is needed if it is used |

## Engineering

| Item | Note |
| --- | --- |
| Postgres | Not installed on the build machine, so migrations and forms were tested on SQLite only. Run against Postgres 16 before launch |
| docker-compose | Written but not run, because Docker is not installed on the build machine |
| Email | Not tested against a real provider or mail catcher. The failure path is covered by a test |
| Turnstile | Code is in place, but not tested with real keys |
| Rate limiter | In memory, so it needs Redis if the API runs more than one instance |
| LCP | 2.25 to 2.6 s on simulated mobile, against a target of under 2.5 s. Re-measure on the real host. The remaining cost is the font swap, which `font-display: optional` would remove |
| Screen reader pass | Not done. Lighthouse accessibility is 100 and keyboard order was spot-checked, but no axe run or manual screen reader test has been done |
