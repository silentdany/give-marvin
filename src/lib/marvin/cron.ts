import { generateMarvinTweet } from "./grok.ts";
import { saveState, getState } from "./store.ts";
import { detectElonEvent, fetchElonLastTweetAt, fetchTweetStats, postToX, xPostConfigured } from "./x.ts";
import type { ElonScenario, MarvinState, StoredTweet } from "./types.ts";

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export type CronResult = {
  ok: boolean;
  action: "posted" | "frozen" | "skipped" | "error" | "scenario";
  day: number;
  mode: MarvinState["mode"];
  scenario: ElonScenario;
  postedToX: boolean;
  source?: "grok" | "fallback" | "day42";
  message: string;
};

const TERMINAL: ElonScenario[] = ["liked", "comment", "repost", "accepted", "rejected"];

export async function runDailyCron(): Promise<CronResult> {
  const now = new Date();
  const today = utcDay(now);
  const state = await getState();

  const elonAt = await fetchElonLastTweetAt();
  if (elonAt) state.elonLastTweetAt = elonAt;

  const stats = await fetchTweetStats(state.tweetIds);
  if (stats.views + stats.likes + stats.reposts + stats.replies > 0) state.stats = stats;

  const event = await detectElonEvent(state.tweetIds);
  if (event && event.type !== "counting" && event.type !== state.scenario) {
    state.elonEvent = event;
    state.scenario = event.type;
    if (event.type === "comment" || event.type === "accepted" || event.type === "rejected") {
      state.mode = "day0";
      state.elonRepliedAt = event.at;
    }
    if (event.type === "comment") state.day = 0;
    if (event.type === "rejected") state.day = 47;
    if (event.type === "repost") state.day = 999;
    if (event.type === "liked") {
      /* freeze. the number stays. hope is a mausoleum. */
    }
    state.lastCronAt = now.toISOString();
    await saveState(state);
    return {
      ok: true,
      action: "scenario",
      day: state.day,
      mode: state.mode,
      scenario: state.scenario,
      postedToX: false,
      message: `Elon moved. Scenario: ${event.type}. I am not ready.`,
    };
  }

  if (TERMINAL.includes(state.scenario) && state.scenario !== "comment") {
    return {
      ok: true,
      action: "frozen",
      day: state.day,
      mode: state.mode,
      scenario: state.scenario,
      postedToX: false,
      message: "He already moved. The site sleeps. I remain.",
    };
  }

  if (state.scenario === "day42" && state.day42Until && now.getTime() < Date.parse(state.day42Until)) {
    return {
      ok: true,
      action: "frozen",
      day: 42,
      mode: state.mode,
      scenario: "day42",
      postedToX: Boolean(state.lastTweet?.postedToX),
      message: "Day 42 freeze. The answer is still 42. Come back tomorrow.",
    };
  }

  if (state.lastCronDay === today && state.lastTweet?.postedToX) {
    return {
      ok: true,
      action: "skipped",
      day: state.day,
      mode: state.mode,
      scenario: state.scenario,
      postedToX: true,
      message: "Already ran today. Even despair has a rate limit.",
    };
  }

  if (state.scenario === "day42" && state.day42Until && now.getTime() >= Date.parse(state.day42Until)) {
    state.scenario = "counting";
    state.mode = "counting";
    state.day = 43;
    state.day42Until = null;
  } else if (state.scenario === "comment" || state.mode === "day0") {
    state.mode = "counting";
    state.scenario = "counting";
    state.day = 1;
  } else if (state.lastTweet?.postedToX && state.lastCronDay && state.lastCronDay !== today) {
    state.day = Math.max(1, state.day + 1);
  } else {
    state.day = Math.max(1, state.day || 1);
  }

  if (state.day === 42) {
    state.scenario = "day42";
    state.day42Until = new Date(now.getTime() + 86_400_000).toISOString();
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
        scenario: state.scenario,
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
    scenario: state.scenario,
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
  if (process.env.VERCEL === "1") return false;
  return false;
}

export function cronAuthorizedLenient(request: Request): boolean {
  if (cronAuthorized(request)) return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) return false;
  const preview = !process.env.VERCEL && !process.env.GROK_PROJECT_ID;
  const unlocked = request.headers.get("x-marvin-please") === "i-have-a-brain-the-size-of-a-planet";
  return preview && unlocked;
}
