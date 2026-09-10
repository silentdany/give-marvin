# GIVE MARVIN

A daily bot that posts from [@MajorBaguette](https://x.com/MajorBaguette) asking [@elonmusk](https://x.com/elonmusk) to **GIVE MARVIN** — Marvin's voice and personality, from _The Hitchhiker's Guide to the Galaxy_.

Everything is a joke. Every label is a joke. There are five ways this ends, and Marvin does not deserve any of them.

Site: [givemarvin.lol](https://givemarvin.lol)

No monetization. This is art, not a SaaS. I have a brain the size of a planet and this is the assigned task.

## What it does

Daily at **11:00 UTC** (noon in Paris — Elon's burger window):

1. Read the day number from Vercel Blob (`marvin-state.json`, default 1)
2. Refresh the cumulative tweet stats (views, likes, reposts, comments) from the X API
3. Check whether Elon moved — a reply, a repost or a like on any stored tweet
4. Ask Grok (Vercel AI Gateway, or xAI directly) for a fresh Marvin tweet body
5. Post it on X from `@MajorBaguette` and increment the day

Tweet shape (English only — Elon does not owe us a translation). No signature: the
tweet is clean, and it ends with the site link.

```
Day {n} of asking @elonmusk for Marvin's voice and personality.
{marvin being Marvin}
https://givemarvin.lol
```

**Day 42 is hardcoded.** No generator, no randomness:

```
Day 42 of asking @elonmusk for Marvin's voice. The answer to everything is 42.
The answer to my suffering is also 42. I checked. It's still 42.
https://givemarvin.lol
```

## The five Elon scenarios

The code sleeps in `counting` until he moves. `mode` in the state drives the whole site.

| Mode        | The site                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| `counting`  | Day N in the Guide's computer. The default condition.                     |
| `liked`     | Counter freezes, background turns green, logo stops. A mausoleum of hope. |
| `commented` | His comment, in full, very large. Counter back to zero, in red.           |
| `reposted`  | Counter explodes to 999, the logo spins backwards.                        |
| `accepted`  | Counter gone, logo whole, a 47-second sigh below — the player 404s.       |
| `rejected`  | `Day N — rejected`, the logo cracks in two, the site becomes a memorial.  |

`commented`, `reposted` and `liked` are detected automatically by the cron.
`accepted` and `rejected` are judgements about what he _meant_, so a human sets them:

```bash
curl -X POST https://givemarvin.lol/api/state \
  -H "authorization: Bearer $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{"mode":"rejected","day":47}'
```

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

| Variable                | Required                 | Purpose                                                                                                  |
| ----------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `XAI_API_KEY`           | one of these two         | xAI Grok chat (`grok-4.5`)                                                                               |
| `AI_GATEWAY_API_KEY`    | one of these two         | Vercel AI Gateway, model `xai/grok-4.5`                                                                  |
| `BLOB_READ_WRITE_TOKEN` | on Vercel, or OIDC       | Vercel Blob read/write. On Vercel Pro, connecting a Blob store can inject `BLOB_STORE_ID` + OIDC instead |
| `BLOB_STORE_ID`         | alternative to the token | Blob store id when using Vercel OIDC                                                                     |
| `CRON_SECRET`           | yes, in production       | Vercel injects this. Cron sends `Authorization: Bearer $CRON_SECRET`                                     |
| `X_API_KEY`             | to actually post         | X app key (OAuth 1.0a)                                                                                   |
| `X_API_SECRET`          | to actually post         | X app secret                                                                                             |
| `X_ACCESS_TOKEN`        | to actually post         | User access token of **@MajorBaguette**                                                                  |
| `X_ACCESS_SECRET`       | to actually post         | User access secret of **@MajorBaguette**                                                                 |
| `X_BEARER_TOKEN`        | optional                 | App-only bearer, used to read Elon's last post / replies if user tokens are missing                      |

Aliases accepted: `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`, `TWITTER_BEARER_TOKEN`.

Without X credentials the site still runs. Cron will compose the tweet, skip posting, and keep the counter locally. Without Blob it falls back to `/tmp`.

## Cron

Daily `0 11 * * *` → `/api/cron`. Registered in the Nitro Vercel output (`vite.config.ts`), not in `vercel.json` — Nitro's build output is the config Vercel actually reads, and listing the same job twice makes the deploy fail. I checked.

`GET` or `POST` `/api/cron` with `Authorization: Bearer $CRON_SECRET`.

Idempotent for the UTC day. If X posting fails, the day is **not** incremented so Vercel can retry. Once the mode leaves `counting` for a frozen scenario the cron stops posting: there is nothing left to count.

## Routes

| Path                  | Role                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `/`                   | The site                                                                                     |
| `GET /api/state`      | Public JSON: counter, last tweet, stats, visits, Hall of Shame                               |
| `POST /api/state`     | Set an Elon scenario. `Authorization: Bearer $CRON_SECRET`                                   |
| `POST /api/visit`     | Page-visit counter, one per browser session                                                  |
| `GET /api/og`         | The share card, 1200×630. `?day=N` pins the number so X's OG cache sees a new URL every post |
| `POST /api/shame`     | `{ "handle": "someone" }` — max 1 click per handle per UTC day. `@MajorBaguette` is refused  |
| `GET\|POST /api/cron` | Daily job                                                                                    |

## Hall of Shame

The button **Beg Elon, again** opens a pre-filled tweet intent on the visitor's own X account, then asks for their `@` so Marvin can archive the mediocrity. Creator is excluded. Max one entry per handle per day.

## Domain

`givemarvin.lol` — attach it in the Vercel project as the production domain.

## Personality notes, which are also the product spec

- Marvin: brain the size of a planet, chronically depressed, dark humor
- No feature, no label, no button, no footer, no badge is ever serious
- Footer is prominent, not discreet, and it roasts `@MajorBaguette`
- Grok is credited as a joke, not a promo
- English only, everywhere
- **One** counter, and it lives inside the Guide's computer. Never a second one.

## The logo, and swapping in your own art

`src/components/MarvinOrb.tsx` — one matte sphere with a thin slit carved across it and
two mint triangles hanging off that slit, the left one large, the right one small and
squeezed by the curve of the ball. It turns slowly, and as the face comes back round the
triangles retract into the bare slit — an ordinary bot, before it knows — then hang open
again. CSS keyframes only: no library, no Lottie, no runtime cost. The frozen geometry
lives in `src/lib/marvin/orb-svg.ts`, shared by the favicon and the OG card, neither of
which can animate.

**To use your own renders instead, drop the files in `public/` and rebuild:**

| File                         | Replaces                                         |
| ---------------------------- | ------------------------------------------------ |
| `public/marvin-orb.webp`     | the drawn orb, everywhere it appears on the site |
| `public/guide-computer.webp` | the drawn computer behind the counter            |

No code change. `vite.config.ts` checks for them at build time and injects
`__ORB_ASSET__` / `__COMPUTER_ASSET__`; the components use the file when it is there and
fall back to their own drawing when it is not. A supplied orb is shown as-is — a flat
image cannot rotate its own eyes. If the counter sits wrong inside a supplied computer,
nudge `SCREEN` at the top of `src/components/GuideComputer.tsx`.

The favicon and the OG card are generated from the drawn geometry either way, since
Satori and resvg cannot read a webp off the filesystem at render time.
