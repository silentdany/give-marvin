# Moving the series from @MajorBaguette to @GiveMarvinBot

Days 1–33 were posted from **@MajorBaguette**. They stay there and are frozen in
`src/data/archive-majorbaguette.json` (shown at `/chronologie`). From **Day 34**
the cron posts from **@GiveMarvinBot**.

The posting account is **@GiveMarvinBot** (X user id `2109269638257238018`).

> **Status (2026-10-11): the @GiveMarvinBot OAuth 1.0a access token/secret are
> already set in Vercel** (`X_ACCESS_TOKEN` / `X_ACCESS_SECRET`). Steps 1–2 below
> are kept for reference (token rotation); what remains is merging this PR and
> redeploying (step 3), then verifying (step 4).

The code side is done by this PR. Posting was paused while
`X_ACCESS_TOKEN` / `X_ACCESS_SECRET` in Vercel **Production** are set to the
placeholder `PAUSED_MOVING_TO_GIVEMARVIN` (X rejects them, the cron returns an
error and does **not** advance the day).

## 1. Generate the @GiveMarvinBot user tokens (same X app)

1. Log in to <https://developer.x.com> with the account that owns the existing
   app (the one whose `X_API_KEY` / `X_API_SECRET` are already in Vercel). Do
   **not** create a new app: the API key/secret stay the same.
2. Projects & Apps → the give-marvin app → **Settings → User authentication
   settings**: confirm **App permissions = Read and write** (and OAuth 1.0a
   enabled). If you change permissions, tokens generated before the change
   are read-only and must be regenerated.
3. The portal's "Generate Access Token and Secret" button issues tokens for the
   account that is logged in. To get them for **@GiveMarvinBot**, either:
   - log in to developer.x.com **as @GiveMarvinBot** if it has been added to the
     app/team, then **Keys and tokens → Access Token and Secret → Generate**; or
   - run the 3-legged OAuth 1.0a PIN flow with the app key/secret while signed
     in to x.com as @GiveMarvinBot,
     with a tiny script:
     ```js
     import { TwitterApi } from "twitter-api-v2";
     const app = new TwitterApi({
       appKey: process.env.X_API_KEY,
       appSecret: process.env.X_API_SECRET,
     });
     const link = await app.generateAuthLink("oob");
     console.log(link.url); // open while logged in as @GiveMarvinBot, copy the PIN
     // then:
     const client = new TwitterApi({
       appKey: process.env.X_API_KEY,
       appSecret: process.env.X_API_SECRET,
       accessToken: link.oauth_token,
       accessSecret: link.oauth_token_secret,
     });
     const { accessToken, accessSecret, screenName } = await client.login(PIN);
     ```
     Check `screenName === "GiveMarvinBot"`.
4. Confirm the tokens show **Read and Write**. Keep them out of the repo.

## 2. Set them in Vercel Production

Project **give-marvin → Settings → Environment Variables**, environment
**Production**:

| Variable          | Value                                                                |
| ----------------- | -------------------------------------------------------------------- |
| `X_ACCESS_TOKEN`  | @GiveMarvinBot access token (replace `PAUSED_MOVING_TO_GIVEMARVIN`)  |
| `X_ACCESS_SECRET` | @GiveMarvinBot access secret (replace `PAUSED_MOVING_TO_GIVEMARVIN`) |

Leave `X_API_KEY`, `X_API_SECRET`, `X_BEARER_TOKEN` unchanged. If the legacy
`TWITTER_ACCESS_TOKEN` / `TWITTER_ACCESS_SECRET` aliases exist, delete or update
them too (the `X_*` names win, but don't leave stale @MajorBaguette tokens).

CLI equivalent:

```
vercel env rm X_ACCESS_TOKEN production && vercel env add X_ACCESS_TOKEN production
vercel env rm X_ACCESS_SECRET production && vercel env add X_ACCESS_SECRET production
```

## 3. Redeploy

Env changes only apply to new deployments. After this PR is merged (it also
bumps `@tanstack/react-start` to ≥ 1.168.61, required since Vercel blocks the
old version for CVE-2026-102989), trigger a Production deploy of `main`
(or **Deployments → … → Redeploy** without build cache if already merged).

## 4. Verify

- `GET https://givemarvin.lol/api/state` → `day: 32`, `mode: "counting"`.
- Next cron (11:00 UTC) posts **Day 33** from @GiveMarvinBot; the returned/stored
  url is `https://x.com/GiveMarvinBot/status/…`.
- `stats.tweets` should be ≥ 33 (32 archived ids + the new one). If it shows an
  error, see `lastStatsError` in the Blob state.

## Why Day 33 is safe

- State in Blob already holds `day: 32` with `lastTweet.postedToX: true`; the
  cron posts `day + 1` on the next UTC day. Failed posts (placeholder tokens)
  return before saving, so nothing advances or resets.
- `nextDay()` now has a floor of 33 while `mode === "counting"`: even if the
  Blob were lost and the state re-seeded at Day 1, it would never re-post days
  1–32.
- Stats: `fetchCumulativeStats` always merges the 32 archived ids with
  `state.tweetIds` (deduplicated, chunked by 100). Lookups by id don't care
  which account posted, so @MajorBaguette tweets keep counting.
- Elon reply detection searches `to:GiveMarvinBot OR to:MajorBaguette`.

## Update 2026-10-11: Day 33 went out from @MajorBaguette

The cron ran at 11:00 UTC (13:00 Paris) on 2026-10-11, before PR #1 was
deployed, so Day 33 was posted by the old code from @MajorBaguette
(<https://x.com/MajorBaguette/status/2109237714142773413>). The Blob state
recorded it (`day: 33`, `lastTweet.postedToX: true`, `lastCronDay: 2026-10-11`),
so the next run (2026-10-12 11:00 UTC) posts **Day 34** from @GiveMarvinBot.

Day 33 was added to the frozen archive and `ARCHIVE_LAST_DAY` is now 33, so
`nextDay()` never returns less than 34 while counting: Day 33 cannot be
re-posted even if the state is lost. The verification and "why it's safe" notes
above that mention Day 32/33 describe the original plan; read them shifted by
one day.
