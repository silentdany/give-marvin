import { generateMarvinTweet } from "./grok";
import { saveState, getState } from "./store";
import { elonRepliedToAny, fetchElonLastTweetAt, postToX, xPostConfigured } from "./x";
import type { MarvinState, StoredTweet } from "./types";

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export type CronResult = {
  ok: boolean;
  action: "posted" | "day0" | "skipped" | "error";
  day: number;
  mode: MarvinState["mode"];
  postedToX: boolean;
  source?: "grok" | "fallback";
  message: string;
};

export async function runDailyCron(): Promise<CronResult> {
  const now = new Date();
  const today = utcDay(now);
  const state = await getState();

  const elonAt = await fetchElonLastTweetAt();
  if (elonAt) state.elonLastTweetAt = elonAt;

  const replied = await elonRepliedToAny(state.tweetIds);
  if (replied && state.mode !== "day0") {
    state.mode = "day0";
    state.day = 0;
    state.elonRepliedAt = now.toISOString();
    state.lastCronAt = now.toISOString();
    state.lastCronDay = today;
    await saveState(state);
    return {
      ok: true,
      action: "day0",
      day: 0,
      mode: "day0",
      postedToX: false,
      message: "Elon replied. Counter on the floor. The happy ending nobody believes.",
    };
  }

  if (state.lastCronDay === today && state.mode === "counting" && state.lastTweet?.postedToX) {
    return {
      ok: true,
      action: "skipped",
      day: state.day,
      mode: state.mode,
      postedToX: state.lastTweet.postedToX,
      message: "Already ran today. Even despair has a rate limit.",
    };
  }

  if (state.mode === "day0") {
    state.mode = "counting";
    state.day = 1;
  } else if (state.lastTweet?.postedToX && state.lastCronDay && state.lastCronDay !== today) {
    state.day = Math.max(1, state.day + 1);
  } else {
    state.day = Math.max(1, state.day || 1);
  }

  const previous = state.lastTweet ? [state.lastTweet.text] : [];
  const generated = await generateMarvinTweet(state.day, previous);

  let postedToX = false;
  let id: string | null = null;
  let url: string | null = null;

  if (xPostConfigured()) {
    const posted = await postToX(generated.text);
    if ("error" in posted) {
      return {
        ok: false,
        action: "error",
        day: state.day,
        mode: state.mode,
        postedToX: false,
        source: generated.source,
        message: `X refused the pain: ${posted.error}`,
      };
    }
    postedToX = true;
    id = posted.id;
    url = posted.url;
    state.tweetIds = [...state.tweetIds, posted.id].slice(-40);
  }

  const tweet: StoredTweet = {
    text: generated.text,
    day: state.day,
    id,
    url,
    postedAt: now.toISOString(),
    postedToX,
  };
  state.lastTweet = tweet;
  state.lastCronAt = now.toISOString();
  if (postedToX) state.lastCronDay = today;
  await saveState(state);

  return {
    ok: true,
    action: "posted",
    day: state.day,
    mode: state.mode,
    postedToX,
    source: generated.source,
    message: postedToX
      ? `Posted day ${state.day}. Nobody asked for this.`
      : `Composed day ${state.day} but X credentials are missing. The void remains unposted.`,
  };
}

export function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (secret) return header === `Bearer ${secret}`;
  // Vercel always injects CRON_SECRET on Pro. Without it, refuse in production.
  if (process.env.VERCEL === "1") return false;
  // Local preview: still refuse anonymous callers. A matching empty secret is not a match.
  return false;
}

/** Preview / emergency hatch: allow if the caller knows CRON_SECRET, always. */
export function cronAuthorizedLenient(request: Request): boolean {
  if (cronAuthorized(request)) return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) return false;
  const preview = !process.env.VERCEL && !process.env.GROK_PROJECT_ID;
  const unlocked = request.headers.get("x-marvin-please") === "i-have-a-brain-the-size-of-a-planet";
  return preview && unlocked;
}
