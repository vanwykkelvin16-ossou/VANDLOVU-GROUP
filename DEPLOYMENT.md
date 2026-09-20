# Deploy Vandlovu Group to Vercel

The repository supports two runtimes: Sites/Cloudflare uses the existing D1 binding; Vercel runs native Next.js with a persistent Turso **libSQL** database. Vercel does not have access to the Sites-managed database or secrets. Importing this repository alone publishes the pages, but does not configure live bookings or email.

## 1. Database

Create a Turso database using its libSQL engine (compatible with `@libsql/client`). Copy its database URL and auth token. Do not use a local SQLite file on Vercel: serverless local files are not persistent.

Set these in a local, ignored `.env.local`, then run the schema setup:

```sh
pnpm install --frozen-lockfile
pnpm db:migrate:vercel
```

```dotenv
TURSO_DATABASE_URL=libsql://YOUR-DATABASE.turso.io
TURSO_AUTH_TOKEN=YOUR-DATABASE-TOKEN
```

The migration runner applies each SQL file transactionally, tracks checksums and safely skips files already applied. It includes the five-booking capacity guards and blocked-date rules. It does not copy existing Sites bookings. If real bookings exist, export and securely import them before switching traffic; retain the original service until the records are reconciled.

## 2. Import the repository

In Vercel, select **Add New → Project → VANDLOVU-GROUP**.

- Root directory: repository root (leave blank).
- Framework: Next.js.
- Node.js: 22.x.
- Install command: `pnpm install --frozen-lockfile`.
- Build command: `pnpm build:vercel`.
- Output directory: `.next`.

`vercel.json` supplies the build settings. No paid cron schedule is used. Choose a Vercel plan eligible for your intended use; check Vercel’s current plan terms for this business service.

## 3. Environment variables

Set these for Production (and use separate database credentials for Preview). Never put secrets in `NEXT_PUBLIC_*` variables or GitHub files.

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` | Persistent libSQL database URL |
| `TURSO_AUTH_TOKEN` | Database access token |
| `ADMIN_EMAIL` | The single administrator’s sign-in email |
| `ADMIN_PASSWORD_HASH` | Generated PBKDF2 hash; not the plaintext password |
| `SESSION_SECRET` | Random session-signing secret, at least 32 characters |
| `GMAIL_CLIENT_ID` | Google OAuth client ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Offline authorisation for the sender mailbox |
| `GMAIL_SENDER` | `vandlovugroup@gmail.com` |

Generate the admin password hash and session secret locally with:

```sh
node scripts/create-admin-hash.mjs
```

Paste the generated colon-separated hash exactly into Vercel’s environment variable field. Older dollar-separated hashes remain supported; when placing an older hash in a Next.js dotenv file, escape each dollar sign as `\$`. Existing Sites secrets must be entered separately; they are not included in this public repository.

## 4. Deploy and finish setup

Deploy the project. Open `/admin`, sign in and save the intended testing schedule in **Settings**. Choose Monday/Wednesday/Friday or every second working day with the correct weekday anchor. A new database deliberately starts with no dates available until this is saved.

Set up the dedicated Gmail mailbox in Google Cloud: enable Gmail API, configure the OAuth consent screen and authorise only `https://www.googleapis.com/auth/gmail.send` with offline access. Do not share or use the mailbox password. Google OAuth Testing mode can expire refresh tokens; complete the appropriate publishing/verification process for the configured application. The three public links below do not by themselves complete Google verification or prove domain ownership.

After adding or changing Vercel variables, redeploy. Submit one real test booking, approve it and confirm both receipt and decision emails arrive. Delete any synthetic test data through a controlled database operation when finished. Unconfigured or failed email is queued and is never falsely shown as sent. An administrator can retry queued messages from Settings.

## Public application links

The Sites publication uses:

- Application home: `https://vandlovu-bookings.kelvinwjg.chatgpt.site/`
- Privacy: `https://vandlovu-bookings.kelvinwjg.chatgpt.site/privacy`
- Terms: `https://vandlovu-bookings.kelvinwjg.chatgpt.site/terms`

After Vercel deployment, use the actual Production domain with the same paths. For Google OAuth, keep the homepage and legal URLs consistent with the application domain and satisfy Google’s domain verification requirements. The public pages require no application account; administrative data remains protected.

## Validation

```sh
pnpm build:vercel
node tests/vercel-integration.mjs
node --experimental-strip-types tests/schedule.test.mjs
```

The integration test starts the production Next server with a temporary libSQL database and synthetic credentials. It checks all public pages, migrations, login, access control, CSRF, ten simultaneous requests for five slots, idempotency, approvals, rejection capacity release, blocked dates and queued emails. It does not send mail or touch production.

For the existing Sites runtime, `pnpm build` and `node tests/integration.mjs` validate the Worker with an isolated D1 database. The Vite configuration selects the Cloudflare runtime adapter; native Next selects the Node/libSQL adapter.

## References

- Vercel deployment: https://vercel.com/docs/deployments
- Turso SDK and transactions: https://docs.turso.tech/sdk/ts/reference
- Google app brand verification: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification
- POPIA information and complaints: https://inforegulator.org.za/popia/
