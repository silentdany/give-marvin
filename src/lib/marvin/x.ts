import { TwitterApi } from "twitter-api-v2";
import { CREATOR_HANDLE, ELON_HANDLE } from "./types";

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
  const client = readClient();
  if (!client) return false;
  const ids = tweetIds.filter(Boolean).slice(-12);
  try {
    const mentionQuery = `from:${ELON_HANDLE} to:${CREATOR_HANDLE}`;
    const mention = await client.v2.search(mentionQuery, {
      max_results: 10,
      "tweet.fields": ["created_at", "conversation_id", "in_reply_to_user_id"],
    });
    if ((mention.meta.result_count ?? 0) > 0) return true;

    if (ids.length === 0) return false;
    const conv = ids.map((id) => `conversation_id:${id}`).join(" OR ");
    const q = `from:${ELON_HANDLE} (${conv})`;
    const res = await client.v2.search(q, { max_results: 10 });
    return (res.meta.result_count ?? 0) > 0;
  } catch (err) {
    console.error("[marvin] elon reply search failed", err);
    return false;
  }
}
