# GIVE MARVIN

A daily bot that posts from [@MajorBaguette](https://x.com/MajorBaguette) asking [@elonmusk](https://x.com/elonmusk) to **GIVE MARVIN** — Marvin's voice and personality, from *The Hitchhiker's Guide to the Galaxy*.

The counter resets the day Elon replies. Everything is a joke. Every label is a joke. The happy ending is Day 0, and nobody believes it.

Site: [givemarvin.lol](https://givemarvin.lol)

No monetization. This is art, not a SaaS. I have a brain the size of a planet and this is the assigned task.

## What it does

Daily at **11:00 UTC** (noon in Paris — Elon's burger window):

1. Read the day number from Vercel Blob (`marvin-state.json`, default 1)
2. Ask Grok (xAI, or Vercel AI Gateway) for a fresh Marvin tweet
3. Post it on X from `@MajorBaguette`
4. Increment the day
5. If Elon has replied to any previous tweet, flip the site to **Day 0** and start again the next run

Required tweet shape (English only — Elon does not owe us a translation):

```
Day {n} of asking @elonmusk for Marvin's voice and personality.
{marvin being Marvin}
https://givemarvin.lol
```

Day 42 is hardcoded. No generator. No randomness. The answer is 42. I checked.

## Stack

TanStack Start + TypeScript, deployed to Vercel. Cron, Blob, Grok and the X API are wired the same way as a Next App Router project: `/api/cron`, `vercel.json`, `@vercel/blob`.

- **Grok** via `XAI_API_KEY` (`https://api.x.ai`) or Vercel AI Gateway (`AI_GATEWAY_API_KEY`)
- **Vercel Blob** for the day counter and Hall of Shame (the Vercel filesystem is read-only)
- **Vercel Cron** (Pro) `0 11 * * *`
- **X API** pay-per-use, OAuth 1.0a user context of `@MajorBaguette` — no separate bot account
- No database. No extra paid add-ons.

Local preview without Blob/X keys stores state in `/tmp/give-marvin-state.json` and still renders the whole joke.

## Environment variables

Do not put secrets in the repo. Set these on Vercel (Production + Preview):

| Variable | Required | Purpose |
|---|---|---|
| `XAI_API_KEY` | one of these two | xAI Grok chat (`grok-4.5`) |
| `AI_GATEWAY_API_KEY` | one of these two | Vercel AI Gateway, model `xai/grok-4.5` |
| `BLOB_READ_WRITE_TOKEN` | on Vercel, or OIDC | Vercel Blob read/write. On Vercel Pro, connecting a Blob store can inject `BLOB_STORE_ID` + OIDC instead |
| `BLOB_STORE_ID` | alternative to the token | Blob store id when using Vercel OIDC |
| `CRON_SECRET` | yes, in production | Vercel injects this. Cron sends `Authorization: Bearer $CRON_SECRET` |
| `X_API_KEY` | to actually post | X app key (OAuth 1.0a) |
| `X_API_SECRET` | to actually post | X app secret |
| `X_ACCESS_TOKEN` | to actually post | User access token of **@MajorBaguette** |
| `X_ACCESS_SECRET` | to actually post | User access secret of **@MajorBaguette** |
| `X_BEARER_TOKEN` | optional | App-only bearer, used to read Elon's last post / replies if user tokens are missing |

Aliases accepted: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`, `TWITTER_BEARER_TOKEN`.

Without X credentials the site still runs. Cron will compose the tweet, skip posting, and keep the counter locally. Without Blob it falls back to `/tmp`.

## Cron

Daily `0 11 * * *` → `/api/cron`. Registered in the Nitro Vercel output (`vite.config.ts`), not in `vercel.json` — Nitro's build output is the config Vercel actually reads, and listing the same job twice makes the deploy fail. I checked.

`GET` or `POST` `/api/cron` with `Authorization: Bearer $CRON_SECRET`.

Idempotent for the UTC day. If X posting fails, the day is **not** incremented so Vercel can retry. If Elon replied, the site goes Day 0 (green) and the next successful cron resumes at Day 1.

## Routes

| Path | Role |
|---|---|
| `/` | The site |
| `GET /api/state` | Public JSON for the counter, last tweet, silence, Hall of Shame |
| `POST /api/shame` | `{ "handle": "someone" }` — max 1 click per handle per UTC day. `@MajorBaguette` is refused |
| `GET\|POST /api/cron` | Daily job |

## Hall of Shame

The button **Supplier Elon, encore** opens a pre-filled tweet intent on the visitor's own X account, then asks for their `@` so Marvin can archive the mediocrity. Creator is excluded. Max one entry per handle per day.

## Domain

`givemarvin.lol` — attach it in the Vercel project as the production domain.

## Personality notes, which are also the product spec

- Marvin: brain the size of a planet, chronically depressed, dark humor
- No feature, no label, no button, no footer, no badge is ever serious
- Footer is prominent, not discreet, and it roasts `@MajorBaguette`
- Grok is credited as a joke, not a promo
