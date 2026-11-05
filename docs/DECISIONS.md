# Decisions

Decisions made without a checkpoint, with the reason for each. The user may overrule any of these.

## Phase 1

| Decision | Reason |
| --- | --- |
| The brief, the deck and `research/deck/` are gitignored | The brief quotes figures that must never be published, so a commit could expose them if the repo is shared. |
| `frontend-design` is read straight from its `SKILL.md` in the marketplace folder | The skill is on disk but not enabled in this session. The real text is used rather than a guess at its contents. |
| npm for the monorepo (pnpm is not installed) | Avoids adding a tool. Can be revisited in Phase 2. |
| Default deployment: web on Vercel, API on Render or Railway, Postgres on Neon | From the brief. The user may change this. |

## Phases 2 to 4

The user chose to build without a formal Checkpoint 1 review, on 5 Nov 2026.

| Decision | Reason |
| --- | --- |
| Held figures are kept out of the repository, with ids only in `metrics.ts` | A `publish: false` value in tracked code can still leak into a bundle or the git history. Stricter than the brief asked |
| Battery cost share is off the site | The brief requires a public source and none is named |
| Built by one agent, not the parallel agent plan | The user raised token cost, and shared components made one pass cheaper |
| `Reveal` and `CountUp` use IntersectionObserver and CSS, and Motion is used only for the scroll sequence | Keeps Motion off phones. Verified in the production build |
| The sequence island writes styles directly, rather than using `m` components | Keeps the stage in server HTML, so it renders with no JS |
| Header and footer links do not prefetch | Prefetching competed with the web font and delayed LCP |
| Legal text stays in English on `/hi`, with a Hindi notice | Unreviewed translation of legal terms is a real risk |
| The fake complaint form from prosparity.in was removed | It told people their complaint was recorded when nothing was sent |
| Roles follow company material where it differs from prosparity.in | It is newer, and the brief lists those names |
| ProsParity wordmark recoloured to forest on light backgrounds | Signal green on white fails contrast and is banned by the brief |
| Tests run on SQLite with the same models and migration | Postgres and Docker are not installed on the build machine |
