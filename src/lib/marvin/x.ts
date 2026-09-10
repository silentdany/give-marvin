import { TwitterApi } from "twitter-api-v2";
import { CREATOR_HANDLE, ELON_HANDLE, type ElonEvent, type ElonScenario, type TweetStats } from "./types.ts";

const ELON_USER_ID = "44196397";

function env(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

function userClient(): TwitterApi | null {
  const appKey = env("X_API_KEY") ?? env("TWITTER_API_KEY");
  const appSecret = env("X_API_SECRET") ?? env("TWITTER_API_SECRET");
  const accessToken = env("X_ACCESS_TOKEN") ?? env("TWITTER_ACCESS_TOKEN");
  const accessSecret = env("X_ACCESS_SECRET") ?? env("TWITTER_ACCESS_SECRET");
  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;
  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

function bearerClient(): TwitterApi | null {
  const bearer = env("X_BEARER_TOKEN") ?? env("TWITTER_BEARER_TOKEN");
  if (!bearer) return null;
  return new TwitterApi(bearer);
}

function readClient(): TwitterApi | null {
  return userClient() ?? bearerClient();
}

export function xPostConfigured(): boolean {
  return userClient() !== null;
}

export function xReadConfigured(): boolean {
  return readClient() !== null;
}

export async function postToX(text: string): Promise<{ id: string; url: string } | { error: string }> {
  const client = userClient();
  if (!client) return { error: "X user credentials missing" };
  try {
    const { data } = await client.v2.tweet(text);
    return {
      id: data.id,
      url: `https://x.com/${CREATOR_HANDLE}/status/${data.id}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "X post failed";
    console.error("[marvin] x post failed", err);
    return { error: message };
  }
}

export async function fetchElonLastTweetAt(): Promise<string | null> {
  const client = readClient();
  if (!client) return null;
  try {
    const timeline = await client.v2.userTimeline(ELON_USER_ID, {
      exclude: ["retweets", "replies"],
      max_results: 5,
      "tweet.fields": ["created_at"],
    });
    const first = timeline.tweets[0];
    return first?.created_at ?? null;
  } catch (err) {
    console.error("[marvin] elon timeline failed", err);
    return null;
  }
}

export async function elonRepliedToAny(tweetIds: string[]): Promise<boolean> {
  const found = await detectElonEvent(tweetIds);
  return Boolean(found && (found.type === "comment" || found.type === "accepted" || found.type === "rejected"));
}

function classifyReply(text: string): ElonScenario {
  const t = text.toLowerCase();
  if (/\b(no|never|stop|won't|will not|nah|rejected|pass)\b/.test(t)) return "rejected";
  if (/\b(yes|done|granted|you (got|have) it|marvin|voice|fine)\b/.test(t)) return "accepted";
  return "comment";
}

export async function fetchTweetStats(ids: string[]): Promise<TweetStats> {
  const empty: TweetStats = { views: 0, likes: 0, reposts: 0, replies: 0 };
  const client = readClient();
  const clean = ids.filter(Boolean).slice(-25);
  if (!client || clean.length === 0) return empty;
  try {
    const res = await client.v2.tweets(clean, { "tweet.fields": ["public_metrics"] });
    const tweets = res.data ?? [];
    return tweets.reduce<TweetStats>((acc, tweet) => {
      const m = tweet.public_metrics;
      acc.views += m?.impression_count ?? 0;
      acc.likes += m?.like_count ?? 0;
      acc.reposts += (m?.retweet_count ?? 0) + (m?.quote_count ?? 0);
      acc.replies += m?.reply_count ?? 0;
      return acc;
    }, { ...empty });
  } catch (err) {
    console.error("[marvin] stats failed", err);
    return empty;
  }
}

export async function detectElonEvent(tweetIds: string[]): Promise<ElonEvent | null> {
  const client = readClient();
  if (!client) return null;
  const now = new Date().toISOString();

  try {
    const mention = await client.v2.search(`from:${ELON_HANDLE} to:${CREATOR_HANDLE}`, {
      max_results: 10,
      "tweet.fields": ["created_at", "text"],
    });
    const reply = mention.tweets[0];
    if (reply?.text) {
      const type = classifyReply(reply.text);
      return { type, at: reply.created_at ?? now, quote: reply.text };
    }
  } catch (err) {
    console.error("[marvin] elon reply search failed", err);
  }

  try {
    const rt = await client.v2.search(`from:${ELON_HANDLE} retweets_of:${CREATOR_HANDLE}`, {
      max_results: 10,
    });
    if ((rt.meta.result_count ?? 0) > 0) {
      return { type: "repost", at: now, quote: null };
    }
  } catch (err) {
    console.error("[marvin] elon repost search failed", err);
  }

  const ids = tweetIds.filter(Boolean).slice(-4);
  for (const id of ids) {
    try {
      const liked = await client.v2.tweetLikedBy(id, { max_results: 100 });
      const hit = (liked.data ?? []).some(
        (u) => u.id === ELON_USER_ID || u.username?.toLowerCase() === ELON_HANDLE,
      );
      if (hit) return { type: "liked", at: now, quote: null };
    } catch {
      // likes endpoint is often locked. I predicted this.
    }
  }

  return null;
}
