# Validation

- Production Worker integration: 10 simultaneous submissions across all four tests accepted exactly 5 and rejected 5; duplicate submission returned the original reference.
- Real D1 persistence, shared capacity, rejection capacity release, approval, final-decision conflict, block/unblock, weekend rejection and public availability privacy passed.
- Admin API authentication, incorrect password, altered session signature, HttpOnly/Secure cookie and cross-origin request rejection passed using ephemeral synthetic credentials.
- Schedule tests cover both patterns, weekend exclusion, South African midnight and exact session start cutoffs.
- Desktop browser: test selection, calendar navigation, contact form and successful booking receipt checked. The submitted synthetic booking was independently read from local D1, then removed.
- Mobile viewport: booking choices and calendar checked at a 375px content width; document and viewport widths matched with no horizontal overflow.
- Gmail intentionally unconfigured. Integration verifies messages remain queued; no live email delivery has been claimed or tested.
- WebMCP registration is feature-detected and uses the same test selection state. Browser runtime reports modelContext unavailable, so live WebMCP execution validation was unavailable.
- Admin dashboard APIs were tested; authenticated admin dashboard browser interaction remains to be checked with the final administrator credentials.
- Production defaults: no default admin credentials, no chosen schedule, no seeded clients, no browser-only booking storage.

## Vercel and public policy update — 20 September 2026

- Native Next.js production build includes the home page, `/privacy`, `/terms`, `/admin` and all booking/admin APIs.
- Next.js + temporary libSQL integration covers public policy links, idempotent migrations, login/CSRF checks, ten concurrent requests for five slots, approval, rejection capacity release, blocked dates and the email queue.
- Existing Sites/Cloudflare + temporary D1 integration passes the same core booking and authentication checks.
- Runtime adapters preserve atomic database batches. No production booking data or secrets are included in the GitHub export.
- Vercel production credentials, database migration and live Gmail delivery remain account-specific setup steps, documented in DEPLOYMENT.md.
