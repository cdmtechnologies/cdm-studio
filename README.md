# CDM Studio

Learn AI, websites, apps, games and data with short hands-on lessons, and build anything with an AI builder that explains every change. By CDM Technologies.

- **Live:** https://cdmtechnologies.github.io/cdm-studio/ (GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main`)
- **Database and AI:** Supabase project "CDM Studio" (CDM Food organisation)

## How it fits together

| Part | Where |
| --- | --- |
| App (React, Vite, Tailwind) | `src/` – hash routes: `#/learn`, `#/build`, `#/explore`, `#/p/<slug>`, `#/account`, `#/owner` |
| Lessons (data, with checks that run in the sandbox) | `src/lessons/` |
| Safe previews | `src/lib/sandbox.ts` – every page runs in an `<iframe sandbox>` without `allow-same-origin` |
| Database | `supabase/migrations/` (tests: `tests/sql/run.sh`) |
| AI builder | `supabase/functions/studio-build` (Verify JWT on) |
| AI tutor | `supabase/functions/studio-tutor` (Verify JWT on) – after changing lessons run `node scripts/lesson-meta.mjs > lesson-meta.sql` and run it in the SQL editor |
| Premium (Paystack) | `supabase/functions/studio-pay` (Verify JWT off; references start `cdmstudio_`) |
| Owner dashboard / Partners Control Centre | `supabase/functions/studio-control` (Verify JWT off) |

Function secrets: `ANTHROPIC_API_KEY`, `PAYSTACK_SECRET_KEY`, `CDM_CONTROL_KEY` (optional). Optional: `STUDIO_BUILD_MODEL`, `STUDIO_PREMIUM_MODEL`, `STUDIO_TUTOR_MODEL`.

## Checks

```sh
npm test                           # unit tests
node scripts/check-lessons.mjs     # every lesson: model answer passes, starter does not (needs Playwright)
PGHOST=/var/run/postgresql sh tests/sql/run.sh   # database rules on a local Postgres
```
