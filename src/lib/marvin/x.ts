import { TwitterApi } from "twitter-api-v2";
import { CREATOR_HANDLE, ELON_HANDLE, type TweetStats } from "./types";

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

export async function postToX(
  text: string,
): Promise<{ id: string; url: string } | { error: string }> {
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

/**
 * Cumulative reach of the whole campaign. Statistics of my own misery,
 * summed over every tweet X still admits to hosting.
 */
export async function fetchCumulativeStats(tweetIds: string[]): Promise<TweetStats | null> {
  const client = readClient();
  if (!client) return null;
  const ids = tweetIds.filter(Boolean).slice(-100);
  if (ids.length === 0) return null;

  const totals: TweetStats = {
    views: 0,
    likes: 0,
    reposts: 0,
    comments: 0,
    tweets: 0,
    updatedAt: new Date().toISOString(),
  };

  try {
    // X caps `tweets` lookups at 100 ids per call; we never keep more than that.
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      const res = await client.v2.tweets(chunk, {
        "tweet.fields": ["public_metrics"],
      });
      for (const tweet of res.data ?? []) {
        const m = tweet.public_metrics;
        if (!m) continue;
        totals.tweets += 1;
        totals.views += m.impression_count ?? 0;
        totals.likes += m.like_count ?? 0;
        totals.reposts += (m.retweet_count ?? 0) + (m.quote_count ?? 0);
        totals.comments += m.reply_count ?? 0;
      }
    }
    return totals;
  } catch (err) {
    console.error("[marvin] stats failed", err);
    return null;
  }
}

export type ElonEngagement = {
  liked: boolean;
  reposted: boolean;
  comment: { text: string; url: string } | null;
};

async function elonLiked(client: TwitterApi, ids: string[]): Promise<boolean> {
  for (const id of ids) {
    try {
      const page = await client.v2.tweetLikedBy(id, { max_results: 100 });
      if ((page.data ?? []).some((u) => u.id === ELON_USER_ID)) return true;
    } catch {
      // Elevated endpoint. If X refuses, the silence stays the default answer.
      return false;
    }
  }
  return false;
}

async function elonReposted(client: TwitterApi, ids: string[]): Promise<boolean> {
  for (const id of ids) {
    try {
      const page = await client.v2.tweetRetweetedBy(id, { max_results: 100 });
      if ((page.data ?? []).some((u) => u.id === ELON_USER_ID)) return true;
    } catch {
      return false;
    }
  }
  return false;
}

async function elonComment(
  client: TwitterApi,
  ids: string[],
): Promise<{ text: string; url: string } | null> {
  try {
    const mention = await client.v2.search(`from:${ELON_HANDLE} to:${CREATOR_HANDLE}`, {
      max_results: 10,
      "tweet.fields": ["created_at", "conversation_id", "in_reply_to_user_id"],
    });
    const direct = mention.tweets?.[0];
    if (direct) {
      return { text: direct.text, url: `https://x.com/${ELON_HANDLE}/status/${direct.id}` };
    }

    if (ids.length === 0) return null;
    const conv = ids.map((id) => `conversation_id:${id}`).join(" OR ");
    const res = await client.v2.search(`from:${ELON_HANDLE} (${conv})`, {
      max_results: 10,
      "tweet.fields": ["created_at"],
    });
    const hit = res.tweets?.[0];
    if (!hit) return null;
    return { text: hit.text, url: `https://x.com/${ELON_HANDLE}/status/${hit.id}` };
  } catch (err) {
    console.error("[marvin] elon reply search failed", err);
    return null;
  }
}

/**
 * The five scenarios all hang off this. The code sleeps until he moves;
 * this is the only thing that ever wakes it up.
 */
export async function fetchElonEngagement(tweetIds: string[]): Promise<ElonEngagement> {
  const client = readClient();
  const none: ElonEngagement = { liked: false, reposted: false, comment: null };
  if (!client) return none;
  const ids = tweetIds.filter(Boolean).slice(-12);

  const [comment, reposted, liked] = await Promise.all([
    elonComment(client, ids),
    ids.length ? elonReposted(client, ids.slice(-4)) : Promise.resolve(false),
    ids.length ? elonLiked(client, ids.slice(-4)) : Promise.resolve(false),
  ]);

  return { liked, reposted, comment };
}

/** Kept for the cron's older code path: did he reply to anything at all. */
export async function elonRepliedToAny(tweetIds: string[]): Promise<boolean> {
  const client = readClient();
  if (!client) return false;
  return (await elonComment(client, tweetIds.filter(Boolean).slice(-12))) !== null;
}
