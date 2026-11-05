# ProsParity current site: crawl summary

Crawled https://prosparity.in/ on 2026-11-05. This records only what the site says. Where the site is silent, this file says so rather than filling the gap. Lines marked "Reviewer note" are the crawler's own observations, not site content.

Full text is in `pages/`, images in `assets/` (see `assets/MANIFEST.md`), screenshots in `screenshots/`. To re-run: `python3 -I scripts/scrape_current_site.py`.

## Most important findings

1. **The complaint form does not send anything.** The form on the grievance page is a front-end mock. On submit it would show "Thanks, your complaint has been recorded. We'll acknowledge it within 48 hours." but no data leaves the browser. This comes from reading the page script and its developer comment. It was not submitted.
2. **The site contradicts itself on what the company is.** Terms say ProsParity "is not engaged in either grant of loan or borrowing any money". The grievance HTML says "RBI-registered NBFC", but only in a header and footer that the live page strips out, so normal visitors never see it. No RBI registration number appears anywhere.
3. **Two different registered offices.** Terms and Privacy say Navi Mumbai. The policy PDF says Bhopal.
4. **No CIN, no NBFC registration details, no Fair Practices Code.**
5. **Terms cite a "Schedule 1" list of lending partners that does not exist on the page.** A partner list does exist, but on the grievance page.
6. **Minimum age conflicts:** Terms say 21, Privacy says 18.
7. **Every route except the home page returns HTTP 404** before React renders it, and all of them carry the home page's title, description and canonical.

## Sitemap

`/sitemap.xml` is an unedited template: its only entry is `https://example.com/` with lastmod 2023-08-01. `robots.txt` allows everything. Pages were found from the bundle's router and by following links.

| Page | URL | HTTP on direct load | Linked from | Capture |
| --- | --- | --- | --- | --- |
| Home | `/` | 200 | Everywhere | `pages/home.md` |
| Terms and Conditions | `/terms-and-conditions` | 404, renders client-side | Footer | `pages/terms-and-conditions.md` |
| Privacy Policy | `/privacy-policy` | 404, renders client-side | Footer, Terms | `pages/privacy-policy.md` |
| DLG Disclosure | `/dlg-disclosure` | 404, renders client-side | Footer | `pages/dlg-disclosure.md` |
| Refund and Cancellation Policy | `/refund-and-cancellation-policy` | 404, renders client-side | Footer | `pages/refund-and-cancellation-policy.md` |
| Grievance Redressal & Disclosures | `/grievance-redressal-and-disclosures` | 404, renders client-side | Footer | `pages/grievance-redressal-and-disclosures.md` |
| Same content, standalone | `/grievance-redressal-and-disclosures.html` | 200 | Iframe source only | `pages/grievance-redressal-and-disclosures-standalone.md` |
| Grievance Redressal Policy (PDF) | `/pdf/ProsParity_Grievance_Redressal_Policy.pdf` | 200 | Grievance page button | `pages/grievance-redressal-policy-pdf.md` |
| Not-found view | any other path | 404 | n/a | `pages/not-found-404.md` |

Home sections, in order: `#hero`, `#products`, `#why-us`, sustainability (no id), `#teams`, `#investors`, `#contact`. Header "About us" goes to `#teams`. There is no separate About, Contact, Careers or Blog page: the router has no such routes, and static checks of `/about`, `/contact`, `/careers` and `/blog` all returned 404.

No unlinked client routes exist beyond those above. The bundle router and the original source (via the public source map) agree.

## Team

The site lists seven people across two tabs. Bios appear only in click-through modals and are captured in full in `pages/home.md`. Photos are 472x472 px.

| Exact name | Exact role on home page | Tab | Photo | LinkedIn |
| --- | --- | --- | --- | --- |
| Saurabh Khodke | Co-Founder and CEO | Founding Team | `assets/saurabh.png` | https://www.linkedin.com/in/saurabh-khodke-80694240/?originalSubdomain=in |
| Anirudh Dhakar | Co-Founder and COO | Founding Team | `assets/anni.png` | https://www.linkedin.com/in/anirudh-dhakar-78979a4b/ |
| Hakam Singh Dhakar | Co-Founder and Business Head | Founding Team | `assets/hakam-dhakar.png` | https://www.linkedin.com/in/hakam-singh-dhakar-935bb9317/ |
| Jitendra Sharma | Co-Founder and Business Head | Founding Team | `assets/jitendra-sharma.png` | https://www.linkedin.com/in/jitendra-sharma-256008318/ |
| Kanishk Agarwal | Founding Member | Founding Team | `assets/kanishk.png` | https://www.linkedin.com/in/kanishk-agarwal?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app |
| Sunil Dubey | State Head | Team | `assets/sunil-dubey.png` | https://www.linkedin.com/in/sunil-dubey-aa121931a/ |
| Rahul Pandey | Lead, Credit Ops | Team | `assets/rahulpandey.png` | https://www.linkedin.com/in/rahul-pandey-871013194/ |

Roles differ elsewhere: the grievance page calls Kanishk Agarwal "Chief Grievance Officer" and "Nodal Grievance Redressal Officer", and calls Jitendra Sharma "Business Head". Sunil Dubey's role is "State Head" but his bio says "area head". Bios say Hakam heads the 3-wheeler segment and Jitendra the 2-wheeler segment.

## Investors and partners

**Investors**, in site order. The site names none of them in text. The alt text on all five is the same ("logo of invesor in the Prosparity"), so these names come from the logos and link targets.

| Name as shown on logo | Link | File |
| --- | --- | --- |
| BEENEXT | https://www.beenext.com/ | `assets/investor1.png` |
| SPARROW | https://www.sparrowvc.com/ | `assets/investor3.png` |
| ALL IN | https://allincapital.vc/ | `assets/investor4.png` |
| DeVC (stylised) | https://www.devc.com/ | `assets/investor5.png` |
| HUDDLE | https://www.huddleventures.vc/ | `assets/investor2.png` |

**Lending partners**, from the grievance page `#partners`. Each is labelled "RBI-registered lending partner". Intro text: "Loans may be facilitated in partnership with the regulated lenders below."

| Name (alt text) | Logo file | Privacy link | Terms link |
| --- | --- | --- | --- |
| Vivriti Capital Limited | `assets/vivriti.jpg` | https://www.vivriticapital.com/assets/files/privacy-policy/PRIVACY_POLICY.pdf | https://www.vivriticapital.com/assets/files/term-condition/Terms%20and%20Conditions%20-%20VCL%20Website%201.pdf |
| DMI Finance | `assets/manba.svg` (filename swapped) | https://www.dmifinance.in/privacy-and-security/ | https://www.dmifinance.in/wp-content/uploads/2025/01/General-Terms-Conditions-020125.pdf |
| Manba Finance | `assets/dmi.svg` (filename swapped) | https://www.manbafinance.com/policies/ | https://www.manbafinance.com/terms-conditions/ |
| Namdev Finvest | `assets/namdev.webp` | https://www.namfin.in/investor/codes-policies | https://admin.namfin.in/storage/app/public/files/media_file/6a3907857b0411782122373.pdf |

**OEM and dealer partners:** none named anywhere. Home mentions OEMs and dealers only as audiences.

**Past employers and education in bios** (not partners): Northern Arc Capital, SBI, Mahindra, Sonalika, L&T Finance, Sundaram Finance, HDFC, Kotak Mahindra, TresVista Analytics, Stashfin, Alstonia Impact, Chola, Hinduja Leyland Finance, BharatPe, IIFM-Bhopal.

## Products

Home `#products` lists three:

| Product | Exact text |
| --- | --- |
| Electric 3 Wheeler | Get loans for efficient and eco-friendly options for last-mile transportation needs |
| Electric 2 Wheeler | Avail loans for reliable and convenient electric two wheelers for urban and rural commuting |
| **Dealer Financing** | With competitive rates and selective assessment criteria, we empower dealers to grow their businesses while fostering strong, mutually beneficial relationships |

**Dealer Financing is present** as the third product card. A "Dealers" card under Why ProsParity adds: "One-stop, quick and convenient financing solution for your business requirements". The site gives no rates, limits or eligibility for any product.

Terms describe a different offering: "personal loan products", "credit cards", credit reports, and a "social score" based on device data and linked social media accounts.

## Contact details

| Item | Value | Where |
| --- | --- | --- |
| General email | hello@prosparity.in | Home, Terms |
| General email, typo | hello@prosarity.in | Privacy (consent withdrawal) |
| Customer support and complaints | help@prosparity.in | Grievance page, PDF |
| Chief Grievance Officer | kanishk@prosparity.in | Grievance page, PDF |
| Business Head | jitendra@prosparity.in | Grievance page, PDF |
| Phone | +91 95820 78336 | Grievance page only, listed for the Nodal Officer |
| LinkedIn | https://www.linkedin.com/company/thrive-trail-private-limited/ | Footer, all pages |
| Website | www.prosparity.in | Terms, Privacy, PDF |
| Home contact form | First name, last name, email, phone, message | Home. Sends through EmailJS. Not submitted. |

There is no general phone number and no address on the home page. No app store links, and no other social links. Meta tags name a Twitter handle, `@prosparity`, but nothing visible links to it.

## Legal entity

- **Entity named:** Etribe Finance Private Limited. Brand: ProsParity. It is the only company the site names as ProsParity's own.
- **CIN:** not on the site.
- **RBI registration or NBFC certificate number:** not on the site.
- **GST or other registration numbers:** not on the site.

| Address | Described as | Where |
| --- | --- | --- |
| Flat No. 904, Keystone Solista, Plot No. 6, Thane, Navi Mumbai, Maharashtra - 400706 | Registered office | Terms, Privacy |
| C-22, First Floor, New Subhash Nagar, Padmanabh Nagar, Ashoka Garden, Bhopal, MP – 462023 | "RO:" in the page footer | PDF, every page |
| Regus Platinum Business Centre Pvt Ltd, Level 13, Platinum Techno Park, Sector 30A, Vashi, Navi Mumbai, Maharashtra, India | Office address of the Nodal Officer | Grievance page |

Reviewer note: the LinkedIn URL slug reads "thrive-trail-private-limited", a name that appears nowhere else on the site. The site does not explain it.

## Grievance Officer

**Present.** Mr Kanishk Agarwal, titled both "Chief Grievance Officer" (Level 2) and "Nodal Grievance Redressal Officer".
- Email: kanishk@prosparity.in
- Phone: +91 95820 78336
- Office: the Regus, Vashi address above

Escalation matrix (grievance page and PDF):

| Level | Who | Contact | Time |
| --- | --- | --- | --- |
| 1 | Customer support | help@prosparity.in | Acknowledged in 48 hrs. Resolved in 5 working days. |
| 2 | Mr Kanishk Agarwal, Chief Grievance Officer | kanishk@prosparity.in | 5 working days of escalation |
| 3 | Mr Jitendra Sharma, Business Head | jitendra@prosparity.in | 5 working days of escalation |
| After all levels | RBI Ombudsman | cms.rbi.org.in, toll-free 14448 (9:30 AM – 5:15 PM) | Not applicable |

## Regulatory documents: what exists

| Item | Status | Detail |
| --- | --- | --- |
| Privacy Policy | **Exists** | `/privacy-policy`. No effective date or version. |
| Terms | **Exists** | `/terms-and-conditions`. No effective date or version. Schedule 1 missing. |
| Grievance Redressal | **Exists** | Page plus 4-page PDF. The "Last updated: 25 June 2026" line is stripped from the live page. |
| Fair Practices Code | **Missing** | No page, PDF, link or mention. Five likely URLs checked, all 404. |
| List of lending partners / regulated entities | **Exists, in one place** | Four lenders on the grievance page. Absent from Terms, where Schedule 1 promises it. |
| NBFC details | **Missing** | The phrase "RBI-registered NBFC" sits only in the standalone HTML. No certificate number, date or RBI office. |
| Refund and Cancellation Policy | **Exists** | `/refund-and-cancellation-policy`. No date. |
| DLG Disclosure | **Exists, thin** | Seven portfolio amounts and a total. No as-of date, no currency, no lender names. |

Also not found on any page: interest rates or APR, fees and charges, Key Fact Statement, sample loan agreement, CIN, app store links, cookie consent banner, careers.

## Numbers and claims by page

**Home**

| Claim | Exact text or value |
| --- | --- |
| Positioning | "Reimagining Distribution Of Credit In The Electric Mobility Sector" |
| Platform | "full-stack digital financing platform to enable seamless flow of credit from lenders to individuals, fleet operators, dealers, and OEMs" |
| Reach | "driving widespread adoption of electric vehicles across Bharat" |
| OEMs | "Omni-channel financing partner for electric products across wide geographies" |
| Lenders | "high-quality secured portfolio in an impact oriented new asset class (electric mobility) through our full-service platform" |
| Customers | "Quick, convenient and affordable loans" |
| Dealers | "competitive rates and selective assessment criteria" |
| Market | "India's growing EV market" |
| Saurabh Khodke | "over 12 years of expertise"; MBA from IIFM-Bhopal |
| Anirudh Dhakar | "over a decade of experience"; MBA from IIFM-Bhopal |
| Hakam Singh Dhakar | "over 23 years of experience" |
| Jitendra Sharma | "over 18 years of experience" |
| Kanishk Agarwal | "over 5 years of extensive experience"; "first employee" |
| Sunil Dubey | "over 20 years of experience" |

The home page has no business metrics: no loan volumes, customer counts, geographies or funding amounts.

**Grievance page and PDF**

| Claim | Value |
| --- | --- |
| Heading | "Four steps, each with a guaranteed response time" |
| Commitments | "five commitments" |
| Timelines | 48 hours to acknowledge; 5 working days at each of Levels 1, 2 and 3 |
| RBI route | "not resolved within 30 days"; Reserve Bank – Integrated Ombudsman Scheme, 2021 |
| RBI contact | 14448 (9:30 AM – 5:15 PM); Centralised Receipt and Processing Centre, Reserve Bank of India, 4th Floor, Sector 17, Chandigarh – 160017 |
| Review cycle | "at least once a year" |
| Dates | Last updated 25 June 2026 (standalone only); PDF created 30 June 2026 (metadata) |

**DLG Disclosure** (amounts exactly as shown, no currency symbol)

| Portfolio | Amount |
| --- | --- |
| Portfolio 1 | 16,60,79,763.00 |
| Portfolio 2 | 12,71,87,933.36 |
| Portfolio 3 | 11,50,58,373.00 |
| Portfolio 4 | 5,99,31,995.20 |
| Portfolio 5 | 2,32,61,243.00 |
| Portfolio 6 | 91,27,284.50 |
| Portfolio 7 | 13,97,888.00 |
| Total | 50,20,44,480.06 |

The seven rows add up to the stated total.

**Refund and Cancellation Policy:** refund processed "within one (1) month from the date of claim acceptance"; claim "within seven (7) days of the date of payment".

**Terms:** minimum age 21; Courts of Mumbai have exclusive jurisdiction; liability capped at "THE AMOUNT ACTUALLY PAID BY YOU TO THE COMPANY FOR THE SERVICE".

**Privacy Policy:** minimum age 18; "All customer data resides within India"; security aligned to "ISO 27001, PCI DSS" and "IS/ISO/IEC 27001"; breaches reported to CERT-In; cites RBI Digital Lending Guidelines 2022 and IT Rules 2011 and 2021. Data collected includes SMS, camera, location, contacts, storage and metadata of installed apps.

## Errors and inconsistencies

Each quote below was checked against the captured text. Legal text in `pages/` keeps these errors on purpose, so it stays verbatim. Corrections are a decision for the legal owner.

**Conflicts between pages**

| Issue | Detail |
| --- | --- |
| Registered office | Navi Mumbai (Terms, Privacy) against Bhopal (PDF) |
| Nature of business | "is not engaged in either grant of loan" (Terms), "digital lending application" (Privacy), "RBI-registered NBFC" (standalone HTML) |
| Minimum age | 21 (Terms) against 18 (Privacy) |
| RBI escalation | "only after exhausting all internal levels" against "not resolved within 30 days, or you are not satisfied" on the same page |
| "Guaranteed" response | Heading promises it for four steps; the fourth has none, and the PDF lists "NA" |
| Channels | Page and PDF promise "multiple channels", but email is the only one listed, and the form is a mock |
| Lending partner list | Terms promise Schedule 1, which is not there |
| Policy name | Privacy refers to "Terms of Use"; the document is called Terms and Conditions |
| Copyright year | "2024" in the site footer; the standalone page computes the current year |
| Offering | Home is EV finance; Terms describe personal loans, credit cards and a social score |
| Mobile app | Terms and Privacy refer to a ProsParity app; the site links to none |

**Missing or broken content**

- Privacy: section "advertisers/ third party links to the platform" is a heading with no body, and is missing from the table of contents.
- Privacy: heading "acceptance of terms and conditions" sits in the middle of "Information We collect", directly above the list of data types.
- Privacy: two numbered lists are run together as inline paragraphs ("1.The Information ... 2.Your providing"; "1.To secure ... 2.While We try").
- Terms: "service suspension" opens at "(a) the rights and licenses..." with no lead-in sentence.
- Terms: the Overview's opening parenthesis "(hereinafter shall be referred to as..." never closes.
- Terms: the disclaimer's list runs (i) to (v), then jumps to (vii). Item "(V)" is also in a different case.
- PDF: "1. Introduction" is stranded alone at the bottom of the cover page.

**Typos**

| Where | Text | Issue |
| --- | --- | --- |
| Privacy | hello@prosarity.in | Should presumably be prosparity. Known. |
| Home | "logo of invesor in the Prosparity" | Alt text, five times |
| Home form | "Form submitted succesfully!" | From source. Only shows on submit. |
| Home form | "Hey. say something" | Placeholder wording |
| 404 | "does not exist or have moved permanently" | Grammar |
| Terms | "monitoring of the platform an your account" | Heading |
| Terms | "user comments, feedback an other submissions" | Heading |
| Terms | "acceptance of term and conditions" | Heading |
| Terms | "register a compliant" | complaint |
| Terms | "ProsParitys’ defense" | Apostrophe |
| Terms | "the Platform / Platform" | Repeated word |
| Terms | "the ProsParity is not engaged" | Stray "the" |
| Terms | "any Term & Conditions" | Singular |
| Terms | "Company’s representative’s" | Apostrophe |
| Terms | "COMPANY EXPRESSLY DISCLAIM" | Verb agreement |
| Terms | "partners lenders, borrowers" | Missing punctuation |
| Terms | "the Privacy Policy is available at" | Missing "which" |
| Privacy | "related Information comply with" | Missing "to" |
| Privacy | "which requires the publishing" | Verb agreement |
| Privacy | "ProsParity" "we" or "us" | Missing comma or "or" |
| PDF | "withing the turn around time" | within |
| PDF | "escalate their 5 complaints" | Stray "5" |

**Stale, technical and SEO**

- Sitemap is a template pointing at `https://example.com/`, lastmod 2023-08-01.
- `manifest.json` is still named "React App".
- Every SPA route has the title "Home | ProsParity", the home meta description and canonical `https://prosparity.in/`.
- Deep routes return HTTP 404 on direct load, so search engines may not index the legal pages.
- `www.prosparity.in` serves 200 with no redirect to the apex domain, creating a duplicate host. `http` does redirect to `https`.
- Terms contain boilerplate that looks copied from elsewhere: "Java applets", "international, federal, provincial or state regulations".
- The grievance HTML ships developer notes in public source, including "NOTES FOR THE FRONTEND DEVELOPER" and a note that the form "currently does nothing on submit".
- The JS source map is public, exposing original source and the EmailJS identifiers. Those identifiers are not reproduced here.
- DMI and Manba logo filenames are swapped. Harmless on the live page, but do not "correct" them by filename.

Reviewer note, from outside the site: Privacy cites the RBI digital lending guidelines of 2022. Legal should confirm that reference is still current.

## Capture notes and limits

- **Completeness:** 8 rendered URLs plus the PDF, with no crawl failures and no asset download failures.
- **Verbatim checks:** Terms, Privacy, Refund and DLG were compared word for word, case-sensitively, against the original TSX source. The only differences came from the comparison itself. Every rendered page was also compared with the browser's text; the remaining differences are the hidden mobile drawer and dropdown options, both listed in each page's capture.
- **Headings:** real tags are preserved. On home, many headings are `<span>`s, so they are inferred from font size and marked with an HTML comment. These levels are inferred.
- **Letter case:** text is taken from the DOM, as written in the source. The site uses CSS to capitalise some headings on screen, so "general" in the file appears as "General" on the page.
- **Not submitted:** neither form. Contact form messages come from the source, not from observed behaviour.
- **Link checks:** 16 external links were checked. 14 responded on the final run with 200 or 206. The two DMI links are unreliable: both returned 200 on an earlier run and timed out on the final run. A manual recheck gave 504 for the privacy page (20 s) and 200 for the terms PDF (11 s). A response shows only that the URL answers, not that the content is right, and LinkedIn may answer 200 regardless. The seven LinkedIn profile links in the bio modals were not checked.
- **Browser:** the installed Playwright expects Chromium build 1208 but only 1194 is cached. The script falls back to the cached 1194 headless shell (Chromium 141). Nothing was installed.
- **Not captured:** hover states; fonts (Manrope via Google Fonts, plus local woff2 files in the CSS); images embedded inside the PDF; phone-width screenshots. A 390 px text pass found no text unique to mobile.
- **Image quality:** team photos max out at 472 px, Namdev's logo at 256x64, and investor logos have a card background baked in. Higher-quality originals will be needed.
- **Extras:** `screenshots/` also has the Team tab, all seven bio modals and the four PDF pages. `crawl-report.json` holds the raw crawl data. `bundle-strings-not-rendered.md` lists strings seen only in the bundle, mostly library messages.
