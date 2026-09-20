# Vandlovu Group test bookings

A responsive brake and lux test booking website with one administrator login, pending/approved/rejected requests, five active bookings per testing day, configurable weekday schedules and Gmail booking updates.

Public routes: `/`, `/privacy`, `/terms`. Administrator route: `/admin`.

## Deploy to Vercel

Import this repository in Vercel using the Next.js preset. The included `vercel.json` selects `pnpm build:vercel` and `.next`. Configure a persistent Turso/libSQL database, migrate it, and set the admin and Gmail variables described in [DEPLOYMENT.md](DEPLOYMENT.md). No production secrets or booking data are stored in this repository.

**The code is deployment-ready; live bookings require database credentials, administrator secrets and a saved testing schedule. Email delivery also requires the Gmail OAuth credentials.**

The original Sites/Cloudflare runtime is retained through a separate adapter and `pnpm build`.

## Local development

Use Node.js 22 and the package manager pinned in `package.json`. Copy `.env.example` to `.env.local`, fill in local values, then:

```sh
pnpm install --frozen-lockfile
pnpm db:migrate:vercel
pnpm dev:vercel
```

For temporary local testing only, `TURSO_DATABASE_URL=file:./local.db` is supported. Never use this on Vercel or commit the database.
