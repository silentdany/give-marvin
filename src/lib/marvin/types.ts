export const CREATOR_HANDLE = "MajorBaguette";
export const ELON_HANDLE = "elonmusk";
export const SITE_HOST = "givemarvin.lol";
export const SITE_URL = "https://givemarvin.lol";
export const STATE_BLOB_PATH = "marvin-state.json";

export const DAY_LINE = (n: number) =>
  `Day ${n} of asking @elonmusk for Marvin's voice and personality.`;

export type ElonScenario = "counting" | "liked" | "comment" | "repost" | "accepted" | "rejected" | "day42";

export type CampaignMode = "counting" | "day0";

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

export type TweetStats = {
  views: number;
  likes: number;
  reposts: number;
  replies: number;
};

export type ElonEvent = {
  type: ElonScenario;
  at: string;
  quote: string | null;
};

export type MarvinState = {
  day: number;
  mode: CampaignMode;
  scenario: ElonScenario;
  startedAt: string;
  lastCronAt: string | null;
  lastCronDay: string | null;
  lastTweet: StoredTweet | null;
  tweetIds: string[];
  elonLastTweetAt: string | null;
  elonRepliedAt: string | null;
  elonEvent: ElonEvent | null;
  day42Until: string | null;
  hallOfShame: ShameEntry[];
  stats: TweetStats;
  pageVisits: number;
};

export type PublicState = {
  day: number;
  mode: CampaignMode;
  scenario: ElonScenario;
  lastTweet: {
    text: string;
    day: number;
    postedAt: string | null;
    url: string | null;
    postedToX: boolean;
  } | null;
  silenceDays: number | null;
  elonLastTweetAt: string | null;
  elonQuote: string | null;
  hallOfShame: { handle: string; clicks: number; lastAt: string }[];
  startedAt: string;
  day42Until: string | null;
  stats: TweetStats;
  pageVisits: number;
};

export type ShameResult =
  | { ok: true; state: PublicState; roast: string }
  | { ok: false; error: string; roast: string };
