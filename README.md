# 6ix Mobile

Virtual phone numbers, SMS, and calling — built with **Expo Router**,
**TypeScript**, Supabase, and Telnyx. Runs on iOS, Android, and web.

## Structure

```
app/                      Expo Router routes (file-based)
  _layout.tsx              Root layout — providers + auth-based redirect
  (auth)/
    _layout.tsx
    sign-in.tsx             Sign in / sign up
  (tabs)/
    _layout.tsx             Bottom tab navigator
    index.tsx                Dashboard & active numbers
    messages.tsx              Conversation thread list
    settings.tsx               Account, credits, billing placeholder
  number-selection.tsx      Number search & purchase (pushed from Dashboard)
  chat/
    [threadId].tsx           Chat + dialer for a single conversation

src/
  api/            supabase.ts, telnyx.ts — all backend integration
  components/     Button, Input, Card, Header — theme-driven primitives
  constants/      theme.ts (design tokens), config.ts (env reads)
  context/        AuthContext, AppContext (theme + active number)
  payment/        plansConfig.ts, PaymentModal.tsx — payment placeholders
  types/          models.ts — shared TS interfaces for all data shapes
  utils/          formatters.ts

server/            Render-deployable Express webhook receiver for Telnyx
                    SMS/call events (keeps the Supabase service-role key
                    off the client entirely). Plain Node/CommonJS —
                    intentionally separate from the Expo/TS app build.

supabase/
  schema.sql       Table definitions + row-level security policies
```

All internal imports use relative paths (`./`, `../`) — there are no
TypeScript path aliases (no `@/...`) anywhere in the app, so Metro's web
bundler resolves every module without extra config.

## Setup

### 1. Install & configure

```bash
npm install
cp .env.example .env   # fill in Supabase + Telnyx keys
npx expo start
```

### 2. Supabase

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy the project URL and anon key into `.env`.

### 3. Telnyx

1. Create a Messaging Profile and a Call Control Connection.
2. Point their webhook URLs at your deployed `/server` backend:
   - Messaging: `https://<your-render-app>.onrender.com/webhooks/telnyx/messaging`
   - Voice: `https://<your-render-app>.onrender.com/webhooks/telnyx/voice`
3. Copy the API key, messaging profile ID, and connection ID into `.env`.

## Deploying the app to Render (web)

The app exports to a static site via Expo's Metro web bundler:

```bash
npm run build:web
# outputs to ./dist
```

On Render, create a **Static Site** service:
- Build command: `npm install && npm run build:web`
- Publish directory: `dist`

No custom server is needed for the static web export — Render serves the
`dist/` output directly.

## Deploying the webhook backend to Render (Node)

```bash
cd server
npm install
cp .env.example .env   # Supabase URL + SERVICE ROLE key (not the anon key)
npm start
```

Deploy `/server` as its own Render **Web Service** (Node). The app never
holds the Supabase service role key — only this backend does.

## TypeScript

- `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`.
- No `paths`/aliases are configured — every import in `app/` and `src/`
  is relative, by design, so web bundling never hits a module-resolution
  error on Render or elsewhere.
- Run `npm run typecheck` to type-check the whole project without emitting.

## Payments

`src/payment` contains structural placeholders only (`plansConfig.ts`,
`PaymentModal.tsx`). Wire a real Stripe or Paystack SDK call into
`PaymentModal`'s `handleConfirm`, fill in real price IDs in
`plansConfig.ts`, and flip `FEATURES.PAYMENTS_ENABLED` in
`src/constants/config.ts` — no other screen needs to change.

## Notes on the Telnyx API key in the client

For production, proxy Telnyx calls (`src/api/telnyx.ts`) through the
Render backend instead of calling `api.telnyx.com` directly from the
device/browser, so the API key never ships inside the installed app or
web bundle. `TELNYX_API_BASE` in `src/constants/config.ts` is the one
place to repoint at your own backend.

## Assets

`app.json` intentionally omits `icon`/`splash.image`/`favicon` references
since no binary assets are included in this scaffold. Add real PNGs under
`/assets` and wire them back into `app.json` before a production/App
Store build.
