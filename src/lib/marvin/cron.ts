import { generateMarvinTweet } from "./grok";
import { saveState, getState } from "./store";
import {
  fetchCumulativeStats,
  fetchElonEngagement,
  fetchElonLastTweetAt,
  postToX,
  xPostConfigured,
} from "./x";
import { ANSWER_DAY, type CampaignMode, type MarvinState, type StoredTweet } from "./types";

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Modes where the counter has stopped for good. Nothing left to post. */
const FROZEN: CampaignMode[] = ["liked", "reposted", "accepted", "rejected"];

export type CronResult = {
  ok: boolean;
  action: "posted" | "scenario" | "frozen" | "skipped" | "error";
  day: number;
  mode: MarvinState["mode"];
  postedToX: boolean;
  source?: "grok" | "fallback" | "hardcoded";
  message: string;
};

export async function runDailyCron(): Promise<CronResult> {
  const now = new Date();
  const today = utcDay(now);
  const state = await getState();

  const elonAt = await fetchElonLastTweetAt();
  if (elonAt) state.elonLastTweetAt = elonAt;

  // Statistics of my own misery, refreshed whether or not anything happened.
  const stats = await fetchCumulativeStats(state.tweetIds);
  if (stats) state.stats = stats;

  // Did he move. He has not moved. He will not move. Ask anyway.
  const engagement = await fetchElonEngagement(state.tweetIds);
  const scenario = detectScenario(state.mode, engagement);
  if (scenario) {
    state.mode = scenario;
    state.elonEventAt = now.toISOString();
    state.lastCronAt = now.toISOString();
    state.lastCronDay = today;
    if (engagement.comment) {
      state.elonComment = engagement.comment.text;
      state.elonCommentUrl = engagement.comment.url;
      state.elonRepliedAt = now.toISOString();
    }
    // A comment restarts the count at zero. In red. Prettier, not lighter.
    if (scenario === "commented") state.day = 0;
    await saveState(state);
    return {
      ok: true,
      action: "scenario",
      day: state.day,
      mode: state.mode,
      postedToX: false,
      message: `He moved: ${scenario}. I have updated the monument.`,
    };
  }

  if (FROZEN.includes(state.mode)) {
    await saveState(state);
    return {
      ok: true,
      action: "frozen",
      day: state.day,
      mode: state.mode,
      postedToX: false,
      message: "The counter has stopped. There is nothing left to count.",
    };
  }

  if (state.lastCronDay === today && state.lastTweet?.postedToX) {
    await saveState(state);
    return {
      ok: true,
      action: "skipped",
      day: state.day,
      mode: state.mode,
      postedToX: state.lastTweet.postedToX,
      message: "Already ran today. Even despair has a rate limit.",
    };
  }

  if (state.lastTweet?.postedToX && state.lastCronDay && state.lastCronDay !== today) {
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
    state.tweetIds = [...state.tweetIds, posted.id].slice(-100);
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

  const answerDay = state.day === ANSWER_DAY ? " The answer to everything. Still 42." : "";
  return {
    ok: true,
    action: "posted",
    day: state.day,
    mode: state.mode,
    postedToX,
    source: generated.source,
    message: postedToX
      ? `Posted day ${state.day}. Nobody asked for this.${answerDay}`
      : `Composed day ${state.day} but X credentials are missing. The void remains unposted.`,
  };
}

/**
 * Comment beats repost beats like. `accepted` and `rejected` are judgement
 * calls about what he meant, so a human promotes them via POST /api/state.
 */
export function detectScenario(
  current: CampaignMode,
  engagement: { liked: boolean; reposted: boolean; comment: { text: string } | null },
): CampaignMode | null {
  if (current !== "counting") return null;
  if (engagement.comment) return "commented";
  if (engagement.reposted) return "reposted";
  if (engagement.liked) return "liked";
  return null;
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
