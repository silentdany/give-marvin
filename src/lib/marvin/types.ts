export const CREATOR_HANDLE = "MajorBaguette";
export const ELON_HANDLE = "elonmusk";
export const SITE_HOST = "givemarvin.lol";
export const SITE_LINK = "https://givemarvin.lol";
export const STATE_BLOB_PATH = "marvin-state.json";

/** The answer to everything. Also the answer to my suffering. */
export const ANSWER_DAY = 42;

export const DAY_LINE = (n: number) =>
  `Day ${n} of asking @elonmusk to give Grok Marvin's voice and personality.`;

/** Day 42 is not generated. Day 42 is decided. No randomness. */
export const DAY_42_TWEET = `Day 42 of asking @elonmusk for Marvin's voice. The answer to everything is 42. The answer to my suffering is also 42. I checked. It's still 42.\n${SITE_LINK}`;

/**
 * Five ways this can end, plus the one where nothing happens.
 * The code sleeps in `counting` until he moves.
 */
export type CampaignMode =
  "counting" | "liked" | "commented" | "reposted" | "accepted" | "rejected";

export const ELON_MODES: CampaignMode[] = [
  "liked",
  "commented",
  "reposted",
  "accepted",
  "rejected",
];

export type StoredTweet = {
  text: string;
  day: number;
  id: string | null;
  url: string | null;
  postedAt: string;
  postedToX: boolean;
};

export type ShameEntry = {
  handle: string;
  clicks: number;
  firstAt: string;
  lastAt: string;
  lastClickDay: string;
};

/** Cumulative across every tweet. Statistics of my own misery. */
export type TweetStats = {
  views: number;
  likes: number;
  reposts: number;
  comments: number;
  tweets: number;
  updatedAt: string | null;
};

export type MarvinState = {
  day: number;
  mode: CampaignMode;
  startedAt: string;
  lastCronAt: string | null;
  lastCronDay: string | null;
  lastTweet: StoredTweet | null;
  tweetIds: string[];
  elonLastTweetAt: string | null;
  elonRepliedAt: string | null;
  /** Set when mode leaves `counting`. The moment he moved. */
  elonEventAt: string | null;
  /** His actual words, shown in full and very large. */
  elonComment: string | null;
  elonCommentUrl: string | null;
  stats: TweetStats;
  visits: number;
  hallOfShame: ShameEntry[];
};

export type PublicState = {
  day: number;
  mode: CampaignMode;
  lastTweet: {
    text: string;
    day: number;
    postedAt: string | null;
    url: string | null;
    postedToX: boolean;
  } | null;
  silenceDays: number | null;
  elonLastTweetAt: string | null;
  elonEventAt: string | null;
  elonComment: string | null;
  elonCommentUrl: string | null;
  stats: TweetStats;
  visits: number;
  hallOfShame: { handle: string; clicks: number; lastAt: string }[];
  startedAt: string;
};

export type ShameResult =
  { ok: true; state: PublicState; roast: string } | { ok: false; error: string; roast: string };

export function isAnswerDay(state: Pick<PublicState, "day" | "mode">): boolean {
  return state.mode === "counting" && state.day === ANSWER_DAY;
}
