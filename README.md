# AgentDeck

An AI agent control panel for small businesses. Owners set up agents (Review Responder, Customer Inbox, Social Media Manager, Invoice Chaser, Lead Qualifier, Quote Builder, Local SEO Writer, or a custom agent), run them on real tasks, and approve every draft from one inbox before it goes out.

- **App** (`/`): Expo + React Native + Expo Router, one codebase for iOS and Android.
- **Server** (`/server`): Vercel functions that call Claude, verify subscriptions, and enforce monthly quotas. The Claude API key only ever lives here.
- **Payments**: RevenueCat, which wraps App Store and Google Play subscriptions.

```
app ──(business profile + task)──▶ server /api/run ──▶ Claude API
 │                                   │  ├─ RevenueCat: is this user Pro?
 └── RevenueCat SDK (purchases)      │  └─ Upstash Redis: runs used this month
```

## Run it locally

```bash
npm install
npx expo start          # press i / a / w for iOS sim, Android, or web
```

With no `EXPO_PUBLIC_API_URL` set, the app runs in **demo mode** and returns sample drafts, so you can click through every screen without a server.

## Go live: checklist

### 1. Deploy the server
1. Create an Anthropic API key at platform.claude.com.
2. Create a free Upstash Redis database (for quotas).
3. `cd server && npx vercel` and set the variables from `server/.env.example`.
4. Put the deployed URL in `.env` as `EXPO_PUBLIC_API_URL`.

### 2. Set up subscriptions
1. **App Store Connect**: create the app (bundle ID `uk.co.bcmediaessex.agentdeck`), then a subscription group with monthly and annual products.
2. **Google Play Console**: create the app (package `uk.co.bcmediaessex.agentdeck`) and matching subscriptions.
3. **RevenueCat**: add both apps, create the entitlement `pro`, attach the products, and make a "current" offering with monthly and annual packages. Copy the public keys into `.env` and the secret key into the server.

Purchases need a development build (not Expo Go):

```bash
npx eas-cli@latest build --profile development --platform ios
```

### 3. Build and submit
```bash
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --platform ios
npx eas-cli@latest submit --platform android
```

### 4. Store review essentials
- Privacy policy URL (must say data is sent to Anthropic for AI processing). The app already asks for consent during onboarding, as Apple requires for third-party AI.
- App Privacy / Data Safety forms: "User content" is collected and sent to a third party for app functionality; not used for tracking.
- Subscription terms, restore, and Terms/Privacy links are already on the paywall.
- Replace the placeholder icon and splash in `assets/`.

## Unit economics

Each run calls `claude-opus-5` at low effort, which costs roughly 2-4p per run. A Pro user who uses all 300 runs costs about £6-12 a month. To cut that roughly in half, set `MODEL` in `server/lib/agent.ts` to `claude-sonnet-5`. Suggested pricing: £14.99/month or £119.99/year. Apple and Google keep 15% of subscription revenue if you enrol in their small-business programmes, so a £14.99 subscriber nets about £12.74.

## Roadmap ideas
- Integrations so agents act directly: Google Business Profile reviews, Gmail/Outlook, Meta, Xero/QuickBooks for invoices.
- Scheduled agents (e.g. "check new reviews every morning") with push notifications for new drafts.
- Accounts with cloud sync so a team can share one control panel (a Business tier).
