import archive from "@/data/archive-majorbaguette.json";

/**
 * Days 1-32 were posted from @MajorBaguette before the series moved to
 * @GiveMarvin. Frozen snapshot, committed; refreshed only by
 * `scripts/snapshot-archive.mjs`.
 */
export type ArchivedTweet = {
  day: number;
  id: string;
  postedAt: string;
  text: string;
  url: string;
  views: number | null;
  likes: number | null;
  reposts: number | null;
  replies: number | null;
};

export type Archive = {
  account: string;
  frozen: boolean;
  snapshotAt: string;
  source: string;
  tweets: ArchivedTweet[];
};

export const ARCHIVE = archive as Archive;
export const ARCHIVE_ACCOUNT = ARCHIVE.account;
export const ARCHIVE_TWEETS: ArchivedTweet[] = [...ARCHIVE.tweets].sort((a, b) => a.day - b.day);
export const ARCHIVE_TWEET_IDS: string[] = ARCHIVE_TWEETS.map((t) => t.id).filter(Boolean);
/** Last day posted from the old account. The cron continues at this + 1. */
export const ARCHIVE_LAST_DAY = 32;
